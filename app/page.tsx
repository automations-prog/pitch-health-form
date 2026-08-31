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
  CheckCircle2,
  ChevronsUpDown,
  FileText,
  Loader2,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  FILE_LABELS,
  MEDICARE_OPTIONS,
  US_STATES,
  emptyForm,
  getStepRequirements,
  getSummaryFields,
  type FormState,
} from "@/lib/onboarding-fields";

const steps = [
  { label: "Your details" },
  { label: "Licensing & address" },
  { label: "Payout & Medicare" },
  { label: "Uploads" },
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
            ? "border-[#5B5FE0] bg-[#F0E5FA]"
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
            <FileText className="w-5 h-5 shrink-0 text-[#5B5FE0]" />
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
            <UploadCloud className="w-5 h-5 mx-auto mb-2 text-[#5B5FE0]" />
            <p className="text-sm text-[#6E677E]">
              <span className="text-[#5B5FE0] font-semibold">
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

function MultiCombobox({
  value,
  onChange,
  options,
  searchPlaceholder = "Search...",
  invalid,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  searchPlaceholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (option: string) => {
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option],
    );
  };

  return (
    <div
      className={cn(
        "min-h-10 w-full rounded-lg border bg-transparent px-2 py-1.5 flex flex-wrap items-center gap-1.5",
        invalid ? "border-destructive" : "border-input",
      )}
    >
      {value.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-full bg-[#F1ECFB] text-[#5B5FE0] text-xs font-medium pl-2.5 pr-1.5 py-1"
        >
          {v}
          <button
            type="button"
            onClick={() => toggle(v)}
            className="rounded-full hover:bg-[#DCD1F0] p-0.5"
            aria-label={`Remove ${v}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-dashed border-[#D9C7EE] text-[#5B5FE0] hover:bg-[#F0E5FA] shrink-0"
              aria-label="Add state"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          }
        />
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => toggle(option)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value.includes(option) ? "opacity-100" : "opacity-0",
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
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-[#201C29] mb-6">
      <span className="w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] shrink-0">
        <Plus className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
      {children}
    </h2>
  );
}

export default function  PitchHealthOnboarding() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [attemptedAdvance, setAttemptedAdvance] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");

  const update = (key: keyof FormState, value: string | null) =>
    setForm((f) => ({ ...f, [key]: value ?? "" }));

  const setFile = (name: string, file: File | null) =>
    setFiles((f) => ({ ...f, [name]: file }));

  const isStepValid = (stepIndex: number) => {
    const { fields, files: requiredFiles } = getStepRequirements(stepIndex);
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
    setSubmitStatus("idle");
    setSubmitError("");
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setSubmitStatus("submitting");
    setSubmitError("");
    try {
      const payload = new FormData();
      for (const [key, value] of Object.entries(form)) {
        payload.set(key, value);
      }
      for (const [key, file] of Object.entries(files)) {
        if (file) payload.set(key, file);
      }
      const res = await fetch("/api/onboarding", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to submit onboarding.");
      }
      setSubmitStatus("success");
      window.setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit onboarding.",
      );
    }
  };

  const summaryFields = getSummaryFields(form);

  const summaryFiles = Object.entries(files).filter(
    (entry): entry is [string, File] => Boolean(entry[1]),
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FAF7FD]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob-float absolute -left-24 top-[8%] h-72 w-72 rounded-full bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] opacity-20 blur-3xl" />
        <div className="animate-blob-float-slow absolute -right-28 top-[35%] h-96 w-96 rounded-full bg-gradient-to-br from-[#A98AD2] to-[#5B5FE0] opacity-20 blur-3xl" />
        <div className="animate-blob-float absolute -left-20 bottom-[6%] h-64 w-64 rounded-full bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] opacity-15 blur-3xl [animation-delay:-4s]" />
        <div className="animate-blob-float-slow absolute right-[6%] bottom-[2%] h-56 w-56 rounded-full bg-gradient-to-br from-[#A98AD2] to-[#5B5FE0] opacity-15 blur-3xl [animation-delay:-2s]" />
      </div>
      <div className="relative w-full max-w-3xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="h-[120px] rounded-lg border border-[#5B5FE0]/20 bg-white flex items-center justify-center mb-9">
        <Image
          src="/logo_pitch_health.png"
          alt="Pitch Health Solutions"
          width={297}
          height={66}
          className="h-16 w-auto"
          priority
        />
      </div>

      <div className="text-center mb-9">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#A98AD2] mb-2">
          Agent onboarding
        </p>
        <h1 className="text-3xl font-extrabold text-[#201C29] leading-tight mb-3">
          Welcome to
          <br />
          Pitch health.
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
            <stop offset="0%" stopColor="#5B5FE0" />
            <stop offset="100%" stopColor="#A98AD2" />
          </linearGradient>
        </defs>
        <path
          id="heartbeatPath"
          d="M0 17 L140 17 L160 4 L180 30 L200 17 L600 17"
          fill="none"
          stroke="url(#pulseGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="animate-draw-line"
        />
        <circle r="4" fill="url(#pulseGrad)">
          <animateMotion
            dur="5s"
            begin="1.2s"
            repeatCount="indefinite"
          >
            <mpath href="#heartbeatPath" />
          </animateMotion>
        </circle>
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
                  ? "bg-[#5B5FE0] text-white border-transparent scale-100"
                  : i === step
                    ? "bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] text-white border-transparent scale-110 shadow-md shadow-[#5B5FE0]/30"
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
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="rounded-2xl border-[#E9E1F3]">
            <CardContent className="p-8">
              <SectionTitle>Licensing & address</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FieldLabel required>Full mailing address</FieldLabel>
                  <Textarea
                    name="mailingAddress"
                    required
                    value={form.mailingAddress}
                    onChange={(e) => update("mailingAddress", e.target.value)}
                    aria-invalid={fieldInvalid("mailingAddress")}
                  />
                </div>

                <div>
                  <FieldLabel required>Resident state</FieldLabel>
                  <Combobox
                    value={form.residentState}
                    onChange={(v) => update("residentState", v)}
                    options={US_STATES}
                    placeholder="Select state"
                    searchPlaceholder="Search state..."
                    invalid={fieldInvalid("residentState")}
                  />
                </div>

                <div>
                  <FieldLabel required>States you&apos;re licensed in</FieldLabel>
                  <MultiCombobox
                    value={
                      form.licensedStates
                        ? form.licensedStates.split(", ").filter(Boolean)
                        : []
                    }
                    onChange={(states) =>
                      update("licensedStates", states.join(", "))
                    }
                    options={US_STATES}
                    searchPlaceholder="Search state..."
                    invalid={fieldInvalid("licensedStates")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel required>NPN</FieldLabel>
                  <p className="text-xs text-[#6E677E] mb-2">
                    If you don&apos;t have an NPN, please insert 0.
                  </p>
                  <Input
                    name="npn"
                    required
                    value={form.npn}
                    onChange={(e) => update("npn", e.target.value)}
                    aria-invalid={fieldInvalid("npn")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-2xl border-[#E9E1F3]">
            <CardContent className="p-8">
              <SectionTitle>Payout & Medicare</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>SSN</FieldLabel>
                  <Input
                    name="ssn"
                    required
                    value={form.ssn}
                    onChange={(e) => update("ssn", e.target.value)}
                    aria-invalid={fieldInvalid("ssn")}
                  />
                </div>

                <div>
                  <FieldLabel required>Are you new to Medicare?</FieldLabel>
                  <Select
                    value={form.medicareNew}
                    onValueChange={(v) => update("medicareNew", v)}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldInvalid("medicareNew")}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICARE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel required>
                    Bank details (please insert your routing & account
                    number)
                  </FieldLabel>
                  <Textarea
                    name="bankDetails"
                    required
                    value={form.bankDetails}
                    onChange={(e) => update("bankDetails", e.target.value)}
                    aria-invalid={fieldInvalid("bankDetails")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-2xl border-[#E9E1F3]">
            <CardContent className="p-8">
              <SectionTitle>Uploads</SectionTitle>
              <div className="flex flex-col gap-5">
                <div>
                  <FieldLabel required>Speed test screenshot</FieldLabel>
                  <p className="text-xs text-[#6E677E] mb-2">
                    Run a test at{" "}
                    <a
                      href="https://speedtest.net"
                      className="text-[#5B5FE0] font-medium"
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
                </div>

                <div>
                  <FieldLabel required>
                    Screenshot of your Social Security Card
                  </FieldLabel>
                  <Dropzone
                    name="ssnCard"
                    required
                    file={files.ssnCard ?? null}
                    invalid={fileInvalid("ssnCard")}
                    onFileChange={(f) => setFile("ssnCard", f)}
                  />
                </div>

                <div>
                  <FieldLabel required>Screenshot of your Photo ID</FieldLabel>
                  <Dropzone
                    name="photoId"
                    required
                    file={files.photoId ?? null}
                    invalid={fileInvalid("photoId")}
                    onFileChange={(f) => setFile("photoId", f)}
                  />
                </div>

                <div className="flex items-start gap-2.5 bg-[#F1ECFB] border border-[#DCD1F0] rounded-lg px-3.5 py-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#A98AD2] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6E677E]">
                    Make sure attachments are clear and complete. Unreadable
                    documents may need to be resubmitted, which can delay
                    processing.
                  </p>
                </div>
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
              className="bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] text-white font-bold rounded-lg px-7 hover:opacity-90"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] text-white font-bold rounded-lg px-7 hover:opacity-90"
            >
              Submit
            </Button>
          )}
        </div>
      </form>

      <p className="text-center text-xs text-[#6E677E] mt-6">
        Do not submit passwords through this form.{" "}
        <a href="#" className="text-[#5B5FE0]">
          Report a problem
        </a>
      </p>
      </div>

      <Dialog
        open={showConfirm}
        onOpenChange={(open) => {
          if (submitStatus === "submitting") return;
          setShowConfirm(open);
        }}
      >
        <DialogContent className="max-w-lg sm:max-w-2xl">
          {submitStatus === "success" ? (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-[#5B5FE0]" />
                  <DialogTitle className="text-xl">
                    Onboarding submitted
                  </DialogTitle>
                  <DialogDescription>
                    Your information has been sent to Pitch health. We&apos;ll
                    be in touch soon.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] text-white font-bold hover:opacity-90"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Confirm your details
                </DialogTitle>
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
              {submitStatus === "error" && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitStatus === "submitting"}
                  onClick={() => setShowConfirm(false)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={confirmSubmit}
                  disabled={submitStatus === "submitting"}
                  className="bg-gradient-to-br from-[#5B5FE0] to-[#A98AD2] text-white font-bold hover:opacity-90"
                >
                  {submitStatus === "submitting" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {submitStatus === "submitting"
                    ? "Submitting…"
                    : submitStatus === "error"
                      ? "Retry"
                      : "Confirm & submit"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
