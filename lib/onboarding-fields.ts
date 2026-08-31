// Shared source of truth for the onboarding form's field labels, used by both
// the client form (app/page.tsx) and the Airtable sync route
// (app/api/onboarding/route.ts) so the on-screen confirmation summary and the
// data actually sent to Airtable can never drift apart.

export type FormState = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  mailingAddress: string;
  residentState: string;
  // Comma-separated list of states the applicant is licensed in, e.g.
  // "California, Texas". Stored as a single string (like every other
  // FormState field) so it round-trips through FormData without special
  // casing; the UI parses/joins it when driving the multi-select.
  licensedStates: string;
  npn: string;
  ssn: string;
  medicareNew: string;
  bankDetails: string;
};

export const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  mailingAddress: "",
  residentState: "",
  licensedStates: "",
  npn: "",
  ssn: "",
  medicareNew: "",
  bankDetails: "",
};

export const MEDICARE_OPTIONS = ["Yes", "No"];

export const US_STATES = [
  "Colorado",
  "New York",
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

// Keys match the Dropzone `name` used on the client, and the FormData keys
// the client posts to the API route. Values are the friendly labels shown in
// the on-screen confirmation modal — these are NOT necessarily the real
// Airtable Attachment column names (see AIRTABLE_FILE_FIELD_NAMES below for
// those).
export const FILE_LABELS: Record<string, string> = {
  speedScreenshot: "Speed test screenshot",
  ssnCard: "Screenshot of your Social Security Card",
  photoId: "Screenshot of your Photo ID",
};

// The real Airtable Attachment column names. NOTE: the Airtable base is being
// rebuilt to match the new form, so these are best-guess names taken
// verbatim from the new form's field labels — confirm against the live
// table schema once it exists and adjust if the actual column names differ.
export const AIRTABLE_FILE_FIELD_NAMES: Record<string, string> = {
  speedScreenshot:
    "Upload your a screenshot of your internet speed. Go to speedtest.net",
  ssnCard: "Screenshot of your Social Security Card",
  photoId: "Screenshot of your Photo ID",
};

// The real Airtable text/select column names. Same caveat as
// AIRTABLE_FILE_FIELD_NAMES above — best guess pending the new Airtable base.
// Used server-side only; the UI keeps using getSummaryFields' labels below
// for display.
export const AIRTABLE_FIELD_NAMES: Partial<Record<keyof FormState, string>> = {
  fullName: "Full Name",
  email: "Personal email",
  phone: "Phone Number",
  dob: "Date of Birth",
  mailingAddress: "Full Mailing Address",
  residentState: "Resident State",
  licensedStates: "States you're licensed in",
  npn: "NPN",
  ssn: "SSN",
  medicareNew: "Are you new to Medicare?",
  bankDetails: "Bank Details (Please insert your Routing & Account Number)",
};

export function getStepRequirements(stepIndex: number) {
  switch (stepIndex) {
    case 0:
      return {
        fields: ["fullName", "email", "phone", "dob"] as (keyof FormState)[],
        files: [] as string[],
      };
    case 1:
      return {
        fields: [
          "mailingAddress",
          "residentState",
          "licensedStates",
          "npn",
        ] as (keyof FormState)[],
        files: [] as string[],
      };
    case 2:
      return {
        fields: ["ssn", "medicareNew", "bankDetails"] as (keyof FormState)[],
        files: [] as string[],
      };
    case 3:
      return {
        fields: [] as (keyof FormState)[],
        files: ["speedScreenshot", "ssnCard", "photoId"],
      };
    default:
      return { fields: [] as (keyof FormState)[], files: [] as string[] };
  }
}

export type SummaryField = {
  key: keyof FormState;
  label: string;
  value: string;
};

// Human-readable label + value pairs for every field, for display in the
// confirmation modal. `key` identifies which FormState field this came from,
// so the server can map it to the real Airtable column via
// AIRTABLE_FIELD_NAMES independently of the display label.
export function getSummaryFields(form: FormState): SummaryField[] {
  return [
    { key: "fullName", label: "Full name", value: form.fullName },
    { key: "email", label: "Personal email", value: form.email },
    { key: "phone", label: "Phone number", value: form.phone },
    { key: "dob", label: "Date of birth", value: form.dob },
    {
      key: "mailingAddress",
      label: "Full mailing address",
      value: form.mailingAddress,
    },
    {
      key: "residentState",
      label: "Resident state",
      value: form.residentState,
    },
    {
      key: "licensedStates",
      label: "States you're licensed in",
      value: form.licensedStates,
    },
    {
      key: "npn",
      label: "NPN",
      value: form.npn,
    },
    { key: "ssn", label: "SSN", value: form.ssn },
    {
      key: "medicareNew",
      label: "Are you new to Medicare?",
      value: form.medicareNew,
    },
    {
      key: "bankDetails",
      label: "Bank details (routing & account number)",
      value: form.bankDetails,
    },
  ];
}
