import {
  AIRTABLE_FIELD_NAMES,
  AIRTABLE_FILE_FIELD_NAMES,
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

  // Build the Airtable payload from the real column names — these differ
  // from the on-screen labels in getSummaryFields (see AIRTABLE_FIELD_NAMES
  // for why).
  const airtableFields: Record<string, string> = {};
  for (const { key, value } of getSummaryFields(form)) {
    if (!value) continue;
    const columnName = AIRTABLE_FIELD_NAMES[key];
    if (!columnName) continue;
    airtableFields[columnName] = value;
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
    return Response.json(
      {
        ok: false,
        error: createData?.error?.message ?? "Failed to create Airtable record.",
      },
      { status: createRes.status },
    );
  }

  const recordId: string = createData.id;

  for (const [key, label] of Object.entries(AIRTABLE_FILE_FIELD_NAMES)) {
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
          filename: file.name,
        }),
      },
    );

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      return Response.json(
        {
          ok: false,
          error:
            uploadData?.error?.message ??
            `Failed to upload attachment for "${label}".`,
        },
        { status: uploadRes.status },
      );
    }
  }

  return Response.json({ ok: true, recordId });
}
