"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  FileText,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Your details" },
  { label: "Address & payout" },
  { label: "Setup check" },
  { label: "Verification" },
];

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Label className="text-sm font-semibold text-[#26212F] mb-1.5 block">
      {children}
      {required && <span className="text-[#C1436A] ml-0.5">*</span>}
    </Label>
  );
}

function Dropzone({
  name,
  required,
  hint,
  file,
  invalid,
  onFileChange,
}: {
  name: string;
  required?: boolean;
  hint?: string;
  file: File | null;
  invalid?: boolean;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    onFileChange(fileList?.[0] ?? null);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={
          "border-[1.5px] border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors " +
          (isDragging
            ? "border-[#8C5FC9] bg-[#F0E5FA]"
            : invalid
              ? "border-destructive bg-destructive/5"
              : "border-[#D9C7EE] bg-[#F5EEFB] hover:bg-[#F0E5FA]")
        }
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          required={required}
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-5 h-5 shrink-0 text-[#8C5FC9]" />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-[#26212F]">
                {file.name}
              </p>
              <p className="text-xs text-[#6E677E]">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="shrink-0 text-[#6E677E] hover:text-[#C1436A]"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="w-5 h-5 mx-auto mb-2 text-[#8C5FC9]" />
            <p className="text-sm text-[#6E677E]">
              <span className="text-[#8C5FC9] font-semibold">
                Choose file
              </span>{" "}
              or drop it here
            </p>
            {hint && <p className="text-xs text-[#6E677E] mt-1">{hint}</p>}
          </>
        )}
      </div>
      {invalid && (
        <p className="text-xs text-destructive mt-1">This file is required.</p>
      )}
    </div>
  );
}

const US_STATES = [
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

const CANADIAN_PROVINCES = [
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

function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            className="w-full justify-between font-normal"
          >
            <span
              className={cn("truncate", !value && "text-muted-foreground")}
            >
              {value || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-[#201C29] mb-6">
      <span className="w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br from-[#8C5FC9] to-[#E17FC4] shrink-0">
        <Plus className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
      {children}
    </h2>
  );
}

type FormState = {
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

const emptyForm: FormState = {
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

const SOURCE_OPTIONS = [
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

function getStepRequirements(
  stepIndex: number,
  country: string,
  source: string,
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
        files: ["govId", "addressDoc"],
      };
    default:
      return { fields: [] as (keyof FormState)[], files: [] as string[] };
  }
}

const FILE_LABELS: Record<string, string> = {
  ssn: "Photo of Social Security card",
  sin: "Photo of Social Insurance Number",
  voidCheque: "Photo of void cheque or direct deposit form",
  speedScreenshot: "Speed test screenshot",
  govId: "Government-issued ID",
  addressDoc: "Document with address",
};

export default function PitchHealthOnboarding() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [attemptedAdvance, setAttemptedAdvance] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key: keyof FormState, value: string | null) =>
    setForm((f) => ({ ...f, [key]: value ?? "" }));

  const setFile = (name: string, file: File | null) =>
    setFiles((f) => ({ ...f, [name]: file }));

  const isStepValid = (stepIndex: number) => {
    const { fields, files: requiredFiles } = getStepRequirements(
      stepIndex,
      form.country,
      form.source,
    );
    const fieldsOk = fields.every((key) => form[key].trim() !== "");
    const filesOk = requiredFiles.every((key) => Boolean(files[key]));
    return fieldsOk && filesOk;
  };

  const fieldInvalid = (key: keyof FormState) =>
    attemptedAdvance && form[key].trim() === "";
  const fileInvalid = (key: string) => attemptedAdvance && !files[key];

  const goNext = () => {
    if (!isStepValid(step)) {
      setAttemptedAdvance(true);
      return;
    }
    setAttemptedAdvance(false);
    setDirection(1);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goBack = () => {
    setAttemptedAdvance(false);
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isStepValid(step)) {
      setAttemptedAdvance(true);
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    alert(
      "Onboarding submitted. Connect this to your backend to submit for real.",
    );
  };

  const summaryFields: { label: string; value: string }[] = [
    { label: "Full name", value: form.fullName },
    { label: "Personal email", value: form.email },
    { label: "Phone number", value: form.phone },
    { label: "Date of birth", value: form.dob },
    { label: "Country of residence", value: form.country },
    { label: "Street address", value: form.street },
    { label: "City", value: form.city },
    ...(form.country === "America"
      ? [
          { label: "State", value: form.usState },
          { label: "Zip code", value: form.zip },
        ]
      : []),
    ...(form.country === "Canada"
      ? [
          { label: "Province", value: form.province },
          { label: "Postal code", value: form.postal },
        ]
      : []),
    {
      label: "Does your Government-issued ID have your Full Address?",
      value: form.idAddress,
    },
    { label: "What brought you to PitchHealth?", value: form.source },
    ...(form.source === "Referred by a current PitchHealth employee"
      ? [{ label: "Who referred you?", value: form.referrer }]
      : []),
    ...(form.source === "Others"
      ? [{ label: "How did you hear about us", value: form.sourceOther }]
      : []),
  ];

  const summaryFiles = Object.entries(files).filter(
    (entry): entry is [string, File] => Boolean(entry[1]),
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FAF7FD]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob-float absolute -left-24 top-[8%] h-72 w-72 rounded-full bg-gradient-to-br from-[#8C5FC9] to-[#E17FC4] opacity-20 blur-3xl" />
        <div className="animate-blob-float-slow absolute -right-28 top-[35%] h-96 w-96 rounded-full bg-gradient-to-br from-[#E17FC4] to-[#8C5FC9] opacity-20 blur-3xl" />
        <div className="animate-blob-float absolute -left-20 bottom-[6%] h-64 w-64 rounded-full bg-gradient-to-br from-[#8C5FC9] to-[#E17FC4] opacity-15 blur-3xl [animation-delay:-4s]" />
        <div className="animate-blob-float-slow absolute right-[6%] bottom-[2%] h-56 w-56 rounded-full bg-gradient-to-br from-[#E17FC4] to-[#8C5FC9] opacity-15 blur-3xl [animation-delay:-2s]" />
      </div>
      <div className="relative w-full max-w-3xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="h-[120px] rounded-lg border border-[#E9E1F3] bg-white flex items-center justify-center mb-9">
        <Image
          src="/logo_black_text.png"
          alt="PitchHealth Solutions"
          width={280}
          height={56}
          className="h-14 w-auto"
          priority
        />
      </div>

      <div className="text-center mb-9">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#E17FC4] mb-2">
          Agent onboarding
        </p>
        <h1 className="text-3xl font-extrabold text-[#201C29] leading-tight mb-3">
          Welcome to
          <br />
          PitchHealth.
        </h1>
        <p className="text-sm text-[#6E677E] max-w-sm mx-auto leading-relaxed">
          A few details so payroll, IT, and compliance can get your line set up.
          About ten minutes, start to finish.
        </p>
      </div>

      <svg
        viewBox="0 0 600 34"
        className="w-full h-8 mt-4"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8C5FC9" />
            <stop offset="100%" stopColor="#E17FC4" />
          </linearGradient>
        </defs>
        <path
          d="M0 17 L140 17 L160 4 L180 30 L200 17 L600 17"
          fill="none"
          stroke="url(#pulseGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="animate-draw-line"
        />
        <path
          d="M0 17 L140 17 L160 4 L180 30 L200 17 L600 17"
          fill="none"
          stroke="url(#pulseGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="animate-pulse-travel"
        />
      </svg>

      <div className="flex justify-between my-4 mb-9">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1.5 flex-1"
          >
            <div
              className={
                "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold border-[1.5px] transition-all duration-300 ease-out " +
                (i < step
                  ? "bg-[#8C5FC9] text-white border-transparent scale-100"
                  : i === step
                    ? "bg-gradient-to-br from-[#8C5FC9] to-[#E17FC4] text-white border-transparent scale-110 shadow-md shadow-[#8C5FC9]/30"
                    : "bg-[#F5EEFB] text-[#6E677E] border-[#E9E1F3] scale-100")
              }
            >
              {i + 1}
            </div>
            <span
              className={
                "text-[11px] text-center hidden sm:block transition-colors duration-300 " +
                (i === step ? "text-[#201C29] font-semibold" : "text-[#6E677E]")
              }
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div
          key={step}
          className={
            "animate-in fade-in duration-300 ease-out " +
            (direction === 1
              ? "slide-in-from-right-6"
              : "slide-in-from-left-6")
          }
        >
        {step === 0 && (
          <Card className="rounded-2xl border-[#E9E1F3]">
            <CardContent className="p-8">
              <SectionTitle>Your details</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FieldLabel required>Full name</FieldLabel>
                  <Input
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    aria-invalid={fieldInvalid("fullName")}
                  />
                </div>
                <div>
                  <FieldLabel required>Personal email</FieldLabel>
                  <Input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={fieldInvalid("email")}
                  />
                </div>
                <div>
                  <FieldLabel required>Phone number</FieldLabel>
                  <Input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    aria-invalid={fieldInvalid("phone")}
                  />
                </div>
                <div>
                  <FieldLabel required>Date of birth</FieldLabel>
                  <Input
                    name="dob"
                    type="date"
                    required
                    value={form.dob}
                    onChange={(e) => update("dob", e.target.value)}
                    aria-invalid={fieldInvalid("dob")}
                  />
                </div>
                <div>
                  <FieldLabel required>Country of residence</FieldLabel>
                  <Select
                    value={form.country}
                    onValueChange={(v) => update("country", v)}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldInvalid("country")}
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America">America</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="rounded-2xl border-[#E9E1F3]">
            <CardContent className="p-8">
              <SectionTitle>Address & payout</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FieldLabel required>Street address</FieldLabel>
                  <Input
                    name="street"
                    required
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                    aria-invalid={fieldInvalid("street")}
                  />
                </div>
                <div
                  className={
                    form.country === "America" || form.country === "Canada"
                      ? undefined
                      : "sm:col-span-2"
                  }
                >
                  <FieldLabel required>City</FieldLabel>
                  <Input
                    name="city"
                    required
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    aria-invalid={fieldInvalid("city")}
                  />
                </div>

                {form.country === "America" && (
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <Combobox
                      value={form.usState}
                      onChange={(v) => update("usState", v)}
                      options={US_STATES}
                      placeholder="Select state"
                      searchPlaceholder="Search state..."
                      invalid={fieldInvalid("usState")}
                    />
                  </div>
                )}
                {form.country === "Canada" && (
                  <div>
                    <FieldLabel required>Province</FieldLabel>
                    <Combobox
                      value={form.province}
                      onChange={(v) => update("province", v)}
                      options={CANADIAN_PROVINCES}
                      placeholder="Select province"
                      searchPlaceholder="Search province..."
                      invalid={fieldInvalid("province")}
                    />
                  </div>
                )}

                {form.country === "America" && (
                  <div>
                    <FieldLabel required>Zip code</FieldLabel>
                    <Input
                      name="zip"
                      required
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value)}
                      aria-invalid={fieldInvalid("zip")}
                    />
                  </div>
                )}
                {form.country === "Canada" && (
                  <div>
                    <FieldLabel required>Postal code</FieldLabel>
                    <Input
                      name="postal"
                      required
                      value={form.postal}
                      onChange={(e) => update("postal", e.target.value)}
                      aria-invalid={fieldInvalid("postal")}
                    />
                  </div>
                )}

                {form.country === "America" && (
                  <div className="sm:col-span-2">
                    <FieldLabel required>
                      Photo of your Social Security card
                    </FieldLabel>
                    <Dropzone
                      name="ssn"
                      required
                      file={files.ssn ?? null}
                      invalid={fileInvalid("ssn")}
                      onFileChange={(f) => setFile("ssn", f)}
                    />
                  </div>
                )}
                {form.country === "Canada" && (
                  <div className="sm:col-span-2">
                    <FieldLabel required>
                      Photo of your Social Insurance Number
                    </FieldLabel>
                    <Dropzone
                      name="sin"
                      required
                      file={files.sin ?? null}
                      invalid={fileInvalid("sin")}
                      onFileChange={(f) => setFile("sin", f)}
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <FieldLabel required>
                    Photo of void cheque or direct deposit form
                  </FieldLabel>
                  <Dropzone
                    name="voidCheque"
                    required
                    file={files.voidCheque ?? null}
                    invalid={fileInvalid("voidCheque")}
                    onFileChange={(f) => setFile("voidCheque", f)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-2xl border-[#E9E1F3]">
            <CardContent className="p-8">
              <SectionTitle>Setup check</SectionTitle>
              <FieldLabel required>Upload speed screenshot</FieldLabel>
              <p className="text-xs text-[#6E677E] mb-2">
                Run a test at{" "}
                <a
                  href="https://speedtest.net"
                  className="text-[#8C5FC9] font-medium"
                >
                  speedtest.net
                </a>{" "}
                and upload the result.
              </p>
              <Dropzone
                name="speedScreenshot"
                required
                file={files.speedScreenshot ?? null}
                invalid={fileInvalid("speedScreenshot")}
                onFileChange={(f) => setFile("speedScreenshot", f)}
              />
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-2xl border-[#E9E1F3]">
            <CardContent className="p-8">
              <SectionTitle>Verification</SectionTitle>
              <div className="flex flex-col gap-5">
                <div>
                  <FieldLabel required>Government-issued ID</FieldLabel>
                  <Dropzone
                    name="govId"
                    required
                    file={files.govId ?? null}
                    invalid={fileInvalid("govId")}
                    onFileChange={(f) => setFile("govId", f)}
                  />
                  <div className="flex items-start gap-2.5 bg-[#FCEEF6] border border-[#F2D3E8] rounded-lg px-3.5 py-3 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E17FC4] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#6E677E]">
                      Make sure attachments are clear and complete. Unreadable
                      documents may need to be resubmitted, which can delay
                      processing.
                    </p>
                  </div>
                </div>

                <div>
                  <FieldLabel required>
                    Does your Government-issued ID have your Full Address?
                  </FieldLabel>
                  <Select
                    value={form.idAddress}
                    onValueChange={(v) => update("idAddress", v)}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldInvalid("idAddress")}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel required>
                    Document with Address (E.g: Piece of mail, Utility Bill)
                  </FieldLabel>
                  <p className="text-xs text-[#6E677E] mb-2">
                    Make sure it&apos;s clear, complete, and easy to read.
                  </p>
                  <Dropzone
                    name="addressDoc"
                    required
                    file={files.addressDoc ?? null}
                    invalid={fileInvalid("addressDoc")}
                    onFileChange={(f) => setFile("addressDoc", f)}
                  />
                </div>

                <div>
                  <FieldLabel required>
                    What brought you to PitchHealth?
                  </FieldLabel>
                  <Select
                    value={form.source}
                    onValueChange={(v) => update("source", v)}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldInvalid("source")}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {form.source === "Referred by a current PitchHealth employee" && (
                  <div>
                    <FieldLabel required>Who referred you?</FieldLabel>
                    <Input
                      name="referrer"
                      required
                      value={form.referrer}
                      onChange={(e) => update("referrer", e.target.value)}
                      aria-invalid={fieldInvalid("referrer")}
                    />
                  </div>
                )}

                {form.source === "Others" && (
                  <div>
                    <FieldLabel required>
                      Please specify how you heard about us
                    </FieldLabel>
                    <Input
                      name="sourceOther"
                      required
                      value={form.sourceOther}
                      onChange={(e) => update("sourceOther", e.target.value)}
                      aria-invalid={fieldInvalid("sourceOther")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        </div>

        {attemptedAdvance && !isStepValid(step) && (
          <p className="text-sm text-destructive text-center mt-4">
            Please fill out all required fields before continuing.
          </p>
        )}

        <div className="flex items-center justify-between mt-7">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 0}
            className="text-[#6E677E] font-semibold disabled:opacity-30"
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              className="bg-gradient-to-br from-[#8C5FC9] to-[#E17FC4] text-white font-bold rounded-lg px-7 hover:opacity-90"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-gradient-to-br from-[#8C5FC9] to-[#E17FC4] text-white font-bold rounded-lg px-7 hover:opacity-90"
            >
              Submit
            </Button>
          )}
        </div>
      </form>

      <p className="text-center text-xs text-[#6E677E] mt-6">
        Do not submit passwords through this form.{" "}
        <a href="#" className="text-[#8C5FC9]">
          Report a problem
        </a>
      </p>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-lg sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm your details</DialogTitle>
            <DialogDescription>
              Please review your information before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
            <dl className="divide-y divide-border">
              {summaryFields.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between gap-4 py-2.5 text-sm"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-right font-medium text-[#201C29]">
                    {row.value || "—"}
                  </dd>
                </div>
              ))}
              {summaryFiles.map(([key, file]) => (
                <div
                  key={key}
                  className="flex justify-between gap-4 py-2.5 text-sm"
                >
                  <dt className="text-muted-foreground">
                    {FILE_LABELS[key] ?? key}
                  </dt>
                  <dd className="text-right font-medium text-[#201C29] truncate max-w-[60%]">
                    {file.name}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              Edit
            </Button>
            <Button
              type="button"
              onClick={confirmSubmit}
              className="bg-gradient-to-br from-[#8C5FC9] to-[#E17FC4] text-white font-bold hover:opacity-90"
            >
              Confirm & submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
