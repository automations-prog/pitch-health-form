// Shared source of truth for the onboarding form's field labels, used by both
// the client form (app/page.tsx) and the Airtable sync route
// (app/api/onboarding/route.ts) so the on-screen confirmation summary and the
// data actually sent to Airtable can never drift apart.

export type FormState = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  country: string;
  street: string;
  city: string;
  usState: string;
  zip: string;
  province: string;
  postal: string;
  idAddress: string;
  source: string;
  referrer: string;
  sourceOther: string;
};

export const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  country: "",
  street: "",
  city: "",
  usState: "",
  zip: "",
  province: "",
  postal: "",
  idAddress: "",
  source: "",
  referrer: "",
  sourceOther: "",
};

export const SOURCE_OPTIONS = [
  "PitchHealth",
  "Friend / Family",
  "Indeed",
  "LinkedIn",
  "Social Media",
  "Recruiter",
  "Job Board",
  "Others",
  "Referred by a current PitchHealth employee",
];

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

export const CANADIAN_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
];

// Keys match the <input name="..."> / Dropzone `name` used on the client, and
// the FormData keys the client posts to the API route. Values are the
// friendly labels shown in the on-screen confirmation modal — these are NOT
// necessarily the real Airtable Attachment column names (see
// AIRTABLE_FILE_FIELD_NAMES below for those).
export const FILE_LABELS: Record<string, string> = {
  ssn: "Photo of Social Security card",
  sin: "Photo of Social Insurance Number",
  voidCheque: "Photo of void cheque or direct deposit form",
  speedScreenshot: "Speed test screenshot",
  govId: "Government-issued ID",
  addressDoc: "Document with address",
};

// The real Airtable Attachment column names, confirmed against the live
// table schema. Used server-side only (app/api/onboarding/route.ts) — the UI
// keeps using the friendlier FILE_LABELS above.
export const AIRTABLE_FILE_FIELD_NAMES: Record<string, string> = {
  ssn: "Photo of your Social Security Card",
  sin: "Photo of your Social Insurance Number",
  voidCheque: "Photo of Void Cheque or Direct Deposit Form",
  speedScreenshot:
    "Upload a screenshot of your internet UPLOAD speed. Go to speedtest.net",
  govId: "Government-issued ID",
  addressDoc: "File with Address",
};

// The real Airtable text/select column names, confirmed against the live
// table schema, keyed by FormState field. `sourceOther` has no dedicated
// column — its value is appended into the "Source" text on the server
// instead. Used server-side only; the UI keeps using getSummaryFields' labels
// below for display.
export const AIRTABLE_FIELD_NAMES: Partial<Record<keyof FormState, string>> = {
  fullName: "Full Name",
  email: "Personal email",
  phone: "Phone Number",
  dob: "Date of Birth",
  country: "Country of Residence",
  street: "Street Address",
  city: "City",
  usState: "State",
  zip: "Zip Code",
  province: "Province",
  postal: "Postal Code",
  idAddress: "Does your Government-issued ID have your Full Address?",
  source: "Source",
  referrer: "Referred By",
};

export function getStepRequirements(
  stepIndex: number,
  country: string,
  source: string,
  idAddress: string,
) {
  switch (stepIndex) {
    case 0:
      return {
        fields: ["fullName", "email", "phone", "dob", "country"] as const,
        files: [] as string[],
      };
    case 1:
      return {
        fields: [
          "street",
          "city",
          ...(country === "America" ? (["usState", "zip"] as const) : []),
          ...(country === "Canada" ? (["province", "postal"] as const) : []),
        ] as (keyof FormState)[],
        files: [
          "voidCheque",
          ...(country === "America" ? ["ssn"] : []),
          ...(country === "Canada" ? ["sin"] : []),
        ],
      };
    case 2:
      return { fields: [] as (keyof FormState)[], files: ["speedScreenshot"] };
    case 3:
      return {
        fields: [
          "idAddress",
          "source",
          ...(source === "Referred by a current PitchHealth employee"
            ? (["referrer"] as const)
            : []),
          ...(source === "Others" ? (["sourceOther"] as const) : []),
        ] as (keyof FormState)[],
        files: [
          "govId",
          ...(idAddress === "No" ? ["addressDoc"] : []),
        ],
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

// Human-readable label + value pairs for every field currently relevant to
// `form` (respecting country/source-conditional fields), for display in the
// confirmation modal. `key` identifies which FormState field this came from,
// so the server can map it to the real Airtable column via
// AIRTABLE_FIELD_NAMES independently of the display label.
export function getSummaryFields(form: FormState): SummaryField[] {
  return [
    { key: "fullName", label: "Full name", value: form.fullName },
    { key: "email", label: "Personal email", value: form.email },
    { key: "phone", label: "Phone number", value: form.phone },
    { key: "dob", label: "Date of birth", value: form.dob },
    { key: "country", label: "Country of residence", value: form.country },
    { key: "street", label: "Street address", value: form.street },
    { key: "city", label: "City", value: form.city },
    ...(form.country === "America"
      ? [
          { key: "usState" as const, label: "State", value: form.usState },
          { key: "zip" as const, label: "Zip code", value: form.zip },
        ]
      : []),
    ...(form.country === "Canada"
      ? [
          {
            key: "province" as const,
            label: "Province",
            value: form.province,
          },
          { key: "postal" as const, label: "Postal code", value: form.postal },
        ]
      : []),
    {
      key: "idAddress",
      label: "Does your Government-issued ID have your Full Address?",
      value: form.idAddress,
    },
    {
      key: "source",
      label: "What brought you to PitchHealth?",
      value: form.source,
    },
    ...(form.source === "Referred by a current PitchHealth employee"
      ? [
          {
            key: "referrer" as const,
            label: "Who referred you?",
            value: form.referrer,
          },
        ]
      : []),
    ...(form.source === "Others"
      ? [
          {
            key: "sourceOther" as const,
            label: "How did you hear about us",
            value: form.sourceOther,
          },
        ]
      : []),
  ];
}
