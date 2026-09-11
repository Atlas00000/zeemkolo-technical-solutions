"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { CalendarSlotGrid, type SlotOption } from "@/components/consultation/CalendarSlotGrid";
import { IntakeForm } from "@/components/consultation/IntakeForm";
import { SERVICE_TYPES } from "@/components/consultation/types";
import {
  bookConsultation,
  fetchConsultationSlots,
  uploadConsultationAttachment,
} from "@/lib/api-client";

type Step = 1 | 2 | 3;

export function ConsultationBookingWizard() {
  const { getToken, isSignedIn } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [serviceType, setServiceType] = useState<string>(SERVICE_TYPES[0]);
  const [projectBrief, setProjectBrief] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    slotStartsAt: string;
    emailSent: boolean;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setSlotsLoading(true);
        const data = await fetchConsultationSlots();
        setSlots(data.slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load slots");
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, []);

  const canContinueStep1 = Boolean(selectedSlot);
  const canContinueStep2 =
    guestName.trim().length >= 2 &&
    guestEmail.includes("@") &&
    projectBrief.trim().length >= 20;

  const selectedLabel = useMemo(() => {
    if (!selectedSlot) return null;
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(selectedSlot));
  }, [selectedSlot]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const token = isSignedIn ? (await getToken()) ?? undefined : undefined;
      let attachmentKey: string | undefined;

      if (file) {
        const buffer = await file.arrayBuffer();
        const contentBase64 = btoa(
          Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(""),
        );
        const uploaded = await uploadConsultationAttachment(
          { filename: file.name, contentBase64 },
          token,
        );
        attachmentKey = uploaded.attachmentKey;
      }

      const result = await bookConsultation(
        {
          guestName,
          guestEmail,
          serviceType,
          projectBrief,
          slotStartsAt: selectedSlot,
          timezone: "Africa/Lagos",
          attachmentKey,
        },
        token,
      );

      setConfirmation({
        id: result.id,
        slotStartsAt: result.slotStartsAt,
        emailSent: result.email.sent,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="space-y-4 rounded border border-green-700/30 bg-green-50 px-5 py-5">
        <h2 className="font-display text-2xl text-brand-ink">Consultation booked</h2>
        <p className="text-sm text-brand-steel">
          Reference <code className="font-mono">{confirmation.id}</code>
        </p>
        <p className="text-sm text-brand-steel">
          Slot:{" "}
          {new Intl.DateTimeFormat("en-GB", {
            timeZone: "Africa/Lagos",
            dateStyle: "full",
            timeStyle: "short",
          }).format(new Date(confirmation.slotStartsAt))}{" "}
          (Africa/Lagos)
        </p>
        <p className="text-sm text-brand-steel">
          {confirmation.emailSent
            ? "Confirmation email with calendar invite sent."
            : "Booking saved. Email invite was skipped (mail not configured or failed)."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex gap-2 text-xs uppercase tracking-[0.15em] text-brand-steel">
        <span className={step === 1 ? "text-brand-signal" : ""}>1 · Slot</span>
        <span>·</span>
        <span className={step === 2 ? "text-brand-signal" : ""}>2 · Details</span>
        <span>·</span>
        <span className={step === 3 ? "text-brand-signal" : ""}>3 · Confirm</span>
      </div>

      {step === 1 ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl text-brand-ink">Pick a time slot</h2>
          <CalendarSlotGrid
            slots={slots}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
            loading={slotsLoading}
          />
          <button
            type="button"
            disabled={!canContinueStep1}
            onClick={() => setStep(2)}
            className="bg-brand-ink px-4 py-2.5 text-sm text-white disabled:opacity-50"
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl text-brand-ink">Project intake</h2>
          <IntakeForm
            guestName={guestName}
            guestEmail={guestEmail}
            serviceType={serviceType}
            projectBrief={projectBrief}
            onChange={(patch) => {
              if (patch.guestName !== undefined) setGuestName(patch.guestName);
              if (patch.guestEmail !== undefined) setGuestEmail(patch.guestEmail);
              if (patch.serviceType !== undefined) setServiceType(patch.serviceType);
              if (patch.projectBrief !== undefined) setProjectBrief(patch.projectBrief);
            }}
          />
          <label className="block">
            <span className="text-sm font-medium text-brand-steel">
              Attachment (optional, max 5MB)
            </span>
            <input
              type="file"
              accept=".pdf,.zip,.png,.jpg,.jpeg,.txt"
              className="mt-2 block w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="border border-brand-steel/20 px-4 py-2.5 text-sm"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!canContinueStep2}
              onClick={() => setStep(3)}
              className="bg-brand-ink px-4 py-2.5 text-sm text-white disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl text-brand-ink">Confirm booking</h2>
          <ul className="space-y-2 text-sm text-brand-steel">
            <li>
              <strong>When:</strong> {selectedLabel}
            </li>
            <li>
              <strong>Service:</strong> {serviceType}
            </li>
            <li>
              <strong>Name:</strong> {guestName}
            </li>
            <li>
              <strong>Email:</strong> {guestEmail}
            </li>
            {file ? (
              <li>
                <strong>File:</strong> {file.name}
              </li>
            ) : null}
          </ul>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="border border-brand-steel/20 px-4 py-2.5 text-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-signal px-4 py-2.5 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "Booking…" : "Confirm consultation"}
            </button>
          </div>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
