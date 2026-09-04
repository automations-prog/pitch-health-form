import {
  AIRTABLE_FIELD_NAMES,
  AIRTABLE_FILE_FIELD_NAMES,
  AIRTABLE_MULTISELECT_FIELDS,
  emptyForm,
  getSummaryFields,
  type FormState,
} from "@/lib/onboarding-fields";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Deter spam: at most 3 submissions per IP every 15 minutes. A genuine
// applicant submits once (or retries a couple times on error); this only
// bites bots/spam hammering the endpoint.
const RATE_LIMIT = { limit: 3, windowMs: 15 * 60 * 1000 };

function readFormState(formData: FormData): FormState {
  const form = { ...emptyForm };
  for (const key of Object.keys(emptyForm) as (keyof FormState)[]) {
    const value = formData.get(key);
    form[key] = typeof value === "string" ? value : "";
  }
  return form;
}

// A message safe to show applicants when something goes wrong upstream.
// Whatever Airtable actually said gets console.error'd (visible in Vercel
// logs) instead of being forwarded to the browser — raw provider errors like
// "The string did not match the expected pattern" are meaningless to an
// applicant and a dead end for support.
const GENERIC_ERROR_MESSAGE =
  "We couldn't submit your form right now. Please try again, or contact support if this keeps happening.";

// Airtable's file-upload API can reject filenames containing spaces, unicode,
// or parentheses with a cryptic error. Normalize to safe ASCII before every
// upload, keeping the extension intact.
function sanitizeFilename(name: string): string {
  const lastDot = name.lastIndexOf(".");
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  const ext = lastDot > 0 ? name.slice(lastDot) : "";

  const safeBase =
    base
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "file";
  const safeExt = ext.replace(/[^\w.]+/g, "");

  return `${safeBase}${safeExt}`;
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, RATE_LIMIT);
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.ceil(rateLimit.retryAfterMs / 1000);
    return Response.json(
      {
        ok: false,
        error: `Too many submissions. Please try again in ${Math.ceil(
          retryAfterSeconds / 60,
        )} minute(s).`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return Response.json(
      {
        ok: false,
        error:
          "Airtable is not configured on the server. Set AIRTABLE_TOKEN, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_NAME.",
      },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const form = readFormState(formData);

  // Resume support: a retry after a partial failure sends back the recordId
  // already created and the keys of files that already uploaded, so we don't
  // re-create the Airtable record or re-upload files that already succeeded.
  const existingRecordId = formData.get("recordId");
  const uploadedKeysRaw = formData.get("uploadedKeys");
  let alreadyUploaded: Set<string>;
  try {
    const parsed =
      typeof uploadedKeysRaw === "string" ? JSON.parse(uploadedKeysRaw) : [];
    alreadyUploaded = new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    alreadyUploaded = new Set();
  }

  let recordId: string;

  if (typeof existingRecordId === "string" && existingRecordId) {
    recordId = existingRecordId;
  } else {
    // Build the Airtable payload from the real column names — these differ
    // from the on-screen labels in getSummaryFields (see AIRTABLE_FIELD_NAMES
    // for why).
    const airtableFields: Record<string, string | string[]> = {};
    for (const { key, value } of getSummaryFields(form)) {
      if (!value) continue;
      const columnName = AIRTABLE_FIELD_NAMES[key];
      if (!columnName) continue;
      airtableFields[columnName] = AIRTABLE_MULTISELECT_FIELDS.includes(key)
        ? value.split(", ").filter(Boolean)
        : value;
    }

    const createRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: airtableFields, typecast: true }),
      },
    );

    const createData = await createRes.json();
    if (!createRes.ok) {
      console.error("Airtable create record failed:", createData);
      return Response.json(
        { ok: false, error: GENERIC_ERROR_MESSAGE },
        { status: createRes.status },
      );
    }

    recordId = createData.id;
  }

  const uploadedThisRequest: string[] = [];

  for (const [key, label] of Object.entries(AIRTABLE_FILE_FIELD_NAMES)) {
    if (alreadyUploaded.has(key)) continue;

    const file = formData.get(key);
    if (!(file instanceof File)) continue;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const uploadRes = await fetch(
      `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${recordId}/${encodeURIComponent(label)}/uploadAttachment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: file.type || "application/octet-stream",
          file: base64,
          filename: sanitizeFilename(file.name),
        }),
      },
    );

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      console.error(`Airtable upload failed for "${label}":`, uploadData);
      // recordId + everything uploaded so far (including from a previous
      // attempt) comes back even on failure, so a retry can resume from here
      // instead of re-creating the record or re-uploading files that already
      // succeeded.
      return Response.json(
        {
          ok: false,
          error: GENERIC_ERROR_MESSAGE,
          recordId,
          uploadedKeys: [...alreadyUploaded, ...uploadedThisRequest],
        },
        { status: uploadRes.status },
      );
    }

    uploadedThisRequest.push(key);
  }

  return Response.json({ ok: true, recordId });
}
