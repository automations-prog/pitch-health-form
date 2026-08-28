"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Plus, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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

function Dropzone({ hint }: { hint?: string }) {
  return (
    <div className="border-[1.5px] border-dashed border-[#D9C7EE] bg-[#F5EEFB] rounded-xl px-4 py-6 text-center cursor-pointer hover:bg-[#F0E5FA] transition-colors">
      <UploadCloud className="w-5 h-5 mx-auto mb-2 text-[#8C5FC9]" />
      <p className="text-sm text-[#6E677E]">
        <span className="text-[#8C5FC9] font-semibold">Choose file</span> or
        drop it here
      </p>
      {hint && <p className="text-xs text-[#6E677E] mt-1">{hint}</p>}
    </div>
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
  country: string;
  idAddress: string;
  source: string;
};

export default function PitchHealthOnboarding() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [form, setForm] = useState<FormState>({
    country: "",
    idAddress: "",
    source: "",
  });

  const update = (key: keyof FormState, value: string | null) =>
    setForm((f) => ({ ...f, [key]: value ?? "" }));

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const required =
      e.currentTarget.querySelectorAll<HTMLInputElement>("[required]");
    let valid = true;
    required.forEach((field) => {
      const visible = field.offsetParent !== null;
      if (visible && !field.value) {
        valid = false;
      }
    });
    if (valid) {
      alert(
        "Form data captured. Connect this to your backend to submit for real.",
      );
    }
  };

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
                  <Input name="fullName" required />
                </div>
                <div>
                  <FieldLabel required>Personal email</FieldLabel>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <FieldLabel required>Phone number</FieldLabel>
                  <Input name="phone" type="tel" required />
                </div>
                <div>
                  <FieldLabel required>Date of birth</FieldLabel>
                  <Input name="dob" type="date" required />
                </div>
                <div>
                  <FieldLabel required>Country of residence</FieldLabel>
                  <Select
                    value={form.country}
                    onValueChange={(v) => update("country", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
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
                  <Input name="street" required />
                </div>
                <div>
                  <FieldLabel required>City</FieldLabel>
                  <Input name="city" required />
                </div>

                {form.country === "US" && (
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {form.country === "CA" && (
                  <div>
                    <FieldLabel required>Province</FieldLabel>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on">Ontario</SelectItem>
                        <SelectItem value="bc">British Columbia</SelectItem>
                        <SelectItem value="qc">Quebec</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {form.country === "US" && (
                  <div>
                    <FieldLabel required>Zip code</FieldLabel>
                    <Input name="zip" />
                  </div>
                )}
                {form.country === "CA" && (
                  <div>
                    <FieldLabel required>Postal code</FieldLabel>
                    <Input name="postal" />
                  </div>
                )}

                {form.country === "US" && (
                  <div className="sm:col-span-2">
                    <FieldLabel required>
                      Photo of your Social Security card
                    </FieldLabel>
                    <Dropzone />
                  </div>
                )}
                {form.country === "CA" && (
                  <div className="sm:col-span-2">
                    <FieldLabel required>
                      Photo of your Social Insurance Number
                    </FieldLabel>
                    <Dropzone />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <FieldLabel required>
                    Photo of void cheque or direct deposit form
                  </FieldLabel>
                  <Dropzone />
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
              <Dropzone />
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
                  <Dropzone />
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
                    Does your ID show your full address?
                  </FieldLabel>
                  <Select
                    value={form.idAddress}
                    onValueChange={(v) => update("idAddress", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
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
                  <Dropzone />
                </div>

                <div>
                  <FieldLabel required>
                    What brought you to PitchHealth?
                  </FieldLabel>
                  <Select
                    value={form.source}
                    onValueChange={(v) => update("source", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="jobboard">Job board</SelectItem>
                      <SelectItem value="social">Social media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel required>Who referred you?</FieldLabel>
                  <Input name="referrer" />
                </div>

                <div>
                  <FieldLabel required>
                    Please specify how you heard about us
                  </FieldLabel>
                  <Input name="sourceOther" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </div>

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
              Submit onboarding
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
    </div>
  );
}
