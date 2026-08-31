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

// "Name - CODE" to match the option format already stored in Airtable's
// "Resident State" and "States you're licensed in:" select fields (e.g.
// "Florida - FL").
const US_STATE_LIST = [
  { name: "Alabama", code: "AL" },
  { name: "Alaska", code: "AK" },
  { name: "Arizona", code: "AZ" },
  { name: "Arkansas", code: "AR" },
  { name: "California", code: "CA" },
  { name: "Colorado", code: "CO" },
  { name: "Connecticut", code: "CT" },
  { name: "Delaware", code: "DE" },
  { name: "Florida", code: "FL" },
  { name: "Georgia", code: "GA" },
  { name: "Hawaii", code: "HI" },
  { name: "Idaho", code: "ID" },
  { name: "Illinois", code: "IL" },
  { name: "Indiana", code: "IN" },
  { name: "Iowa", code: "IA" },
  { name: "Kansas", code: "KS" },
  { name: "Kentucky", code: "KY" },
  { name: "Louisiana", code: "LA" },
  { name: "Maine", code: "ME" },
  { name: "Maryland", code: "MD" },
  { name: "Massachusetts", code: "MA" },
  { name: "Michigan", code: "MI" },
  { name: "Minnesota", code: "MN" },
  { name: "Mississippi", code: "MS" },
  { name: "Missouri", code: "MO" },
  { name: "Montana", code: "MT" },
  { name: "Nebraska", code: "NE" },
  { name: "Nevada", code: "NV" },
  { name: "New Hampshire", code: "NH" },
  { name: "New Jersey", code: "NJ" },
  { name: "New Mexico", code: "NM" },
  { name: "New York", code: "NY" },
  { name: "North Carolina", code: "NC" },
  { name: "North Dakota", code: "ND" },
  { name: "Ohio", code: "OH" },
  { name: "Oklahoma", code: "OK" },
  { name: "Oregon", code: "OR" },
  { name: "Pennsylvania", code: "PA" },
  { name: "Rhode Island", code: "RI" },
  { name: "South Carolina", code: "SC" },
  { name: "South Dakota", code: "SD" },
  { name: "Tennessee", code: "TN" },
  { name: "Texas", code: "TX" },
  { name: "Utah", code: "UT" },
  { name: "Vermont", code: "VT" },
  { name: "Virginia", code: "VA" },
  { name: "Washington", code: "WA" },
  { name: "West Virginia", code: "WV" },
  { name: "Wisconsin", code: "WI" },
  { name: "Wyoming", code: "WY" },
];

export const US_STATES = US_STATE_LIST.map((s) => `${s.name} - ${s.code}`);

// The subset of states agents can actually be licensed in, for the "States
// you're licensed in" multi-select. Smaller than US_STATES (used for
// Resident state), which stays the full list.
const LICENSED_STATE_LIST = [
  { name: "Alabama", code: "AL" },
  { name: "Arizona", code: "AZ" },
  { name: "Florida", code: "FL" },
  { name: "Illinois", code: "IL" },
  { name: "Louisiana", code: "LA" },
  { name: "Michigan", code: "MI" },
  { name: "Mississippi", code: "MS" },
  { name: "North Carolina", code: "NC" },
  { name: "Ohio", code: "OH" },
  { name: "Oklahoma", code: "OK" },
  { name: "Pennsylvania", code: "PA" },
  { name: "South Carolina", code: "SC" },
  { name: "Tennessee", code: "TN" },
  { name: "Texas", code: "TX" },
  { name: "Virginia", code: "VA" },
  { name: "Iowa", code: "IA" },
  { name: "Georgia", code: "GA" },
  { name: "Missouri", code: "MO" },
  { name: "Indiana", code: "IN" },
  { name: "New Mexico", code: "NM" },
];

export const LICENSED_STATES = LICENSED_STATE_LIST.map(
  (s) => `${s.name} - ${s.code}`,
);

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

// The real Airtable Attachment column names, confirmed live against the
// table (tbllK7OneV8hg4Qcv) on 2026-08-31.
export const AIRTABLE_FILE_FIELD_NAMES: Record<string, string> = {
  speedScreenshot:
    "Upload your a screenshot of your internet speed. Go to speedtest.net",
  ssnCard: "Screenshot of your Social Security Card",
  photoId: "Photo ID",
};

// The real Airtable text/select column names, confirmed live against the
// table (tbllK7OneV8hg4Qcv) on 2026-08-31. Used server-side only; the UI
// keeps using getSummaryFields' labels below for display.
export const AIRTABLE_FIELD_NAMES: Partial<Record<keyof FormState, string>> = {
  fullName: "Full Name",
  // "Email" is a computed column derived from "Personal email" — write the
  // real "Personal email" column.
  email: "Personal email",
  phone: "Phone Number",
  dob: "Date of Birth",
  mailingAddress: "Full Mailing Address",
  residentState: "Resident State",
  licensedStates: "States you're licensed in:",
  npn: "NPN",
  ssn: "SSN",
  medicareNew: "Are you new to Medicare?",
  bankDetails: "Bank Details",
};

// Airtable columns that are multi-select and need an array of strings
// rather than a single comma-joined string (see route.ts).
export const AIRTABLE_MULTISELECT_FIELDS: (keyof FormState)[] = [
  "licensedStates",
];

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
