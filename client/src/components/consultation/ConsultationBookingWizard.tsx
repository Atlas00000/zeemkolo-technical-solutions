"use client";

import { FormEvent, useEffect, useMemo, useState, type PointerEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  CalendarSlotGrid,
  type SlotOption,
} from "@/components/consultation/CalendarSlotGrid";
import { IntakeForm } from "@/components/consultation/IntakeForm";
import { SERVICE_TYPES } from "@/components/consultation/types";
import {
  BookingDeskProvider,
  BookingField,
  BookingHeader,
  BookingInstrument,
  BookingRail,
  BookingStage,
  useBookingDesk,
  type BookingStep,
} from "@/components/consultation/booking";
import {
  bookConsultation,
  fetchConsultationSlots,
  uploadConsultationAttachment,
} from "@/lib/api-client";
import { Button } from "@/design/primitives/Button";
import { Badge } from "@/design/primitives/Badge";
import { Surface } from "@/design/primitives/Surface";
import { Text } from "@/design/primitives/Text";
import { StateCrossfade } from "@/design/motion/StateCrossfade";
import { consultationTone } from "@/design/map/backend-status";
import "./booking/booking-motion.css";

type Step = BookingStep;

function BookingDeskShell({
  children,
  step,
}: {
  children: React.ReactNode;
  step: Step;
}) {
  const { setPointer, reducedMotion } = useBookingDesk();

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      active: true,
    });
  }

  function onPointerLeave() {
    setPointer({ x: 0.72, y: 0.28, active: false });
  }

  return (
    <section
      className="relative isolate overflow-hidden text-[var(--ln-ink)]"
      data-booking-desk
      data-booking-step={step}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <BookingField />
      {children}
    </section>
  );
}

export function ConsultationBookingWizard() {
  const { getToken, isSignedIn } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [unlocked, setUnlocked] = useState<Step>(1);
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

  function goTo(next: Step) {
    setStep(next);
    setUnlocked((u) => (next > u ? next : u));
  }

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
          Array.from(new Uint8Array(buffer), (b) =>
            String.fromCharCode(b),
          ).join(""),
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

  const stageTitle =
    step === 1
      ? "Pick a time slot"
      : step === 2
        ? "Project intake"
        : "Confirm booking";

  if (confirmation) {
    const tone = consultationTone("CONFIRMED");
    return (
      <BookingDeskProvider step={3}>
        <BookingDeskShell step={3}>
          <div className="relative z-10 mx-auto grid max-w-shell gap-8 px-[var(--ln-page-x)] py-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:py-12">
            <div>
              <BookingHeader />
              <div className="mt-8 max-w-2xl">
                <StateCrossfade stateKey={confirmation.id} tone={tone}>
                  <Surface variant="signal" padding="lg" className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Text variant="title">Consultation booked</Text>
                      <Badge tone={tone}>CONFIRMED</Badge>
                    </div>
                    <Text variant="muted">
                      Reference{" "}
                      <code className="ln-tabular text-[var(--ln-signal)]">
                        {confirmation.id}
                      </code>
                    </Text>
                    <Text variant="muted">
                      Slot:{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        timeZone: "Africa/Lagos",
                        dateStyle: "full",
                        timeStyle: "short",
                      }).format(new Date(confirmation.slotStartsAt))}{" "}
                      (Africa/Lagos)
                    </Text>
                    <Text variant="muted">
                      {confirmation.emailSent
                        ? "Confirmation email with calendar invite sent."
                        : "Booking saved. Email invite was skipped (mail not configured or failed)."}
                    </Text>
                  </Surface>
                </StateCrossfade>
              </div>
            </div>
            <BookingInstrument />
          </div>
        </BookingDeskShell>
      </BookingDeskProvider>
    );
  }

  return (
    <BookingDeskProvider step={step}>
      <BookingDeskShell step={step}>
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
            <div className="min-w-0">
              <BookingHeader />

              <form
                onSubmit={onSubmit}
                className="mt-6 flex min-h-0 flex-col gap-5 md:mt-8"
              >
                <BookingRail step={step} onStep={goTo} unlocked={unlocked} />

                <BookingStage key={step} title={stageTitle}>
                  {step === 1 ? (
                    <>
                      <CalendarSlotGrid
                        slots={slots}
                        selected={selectedSlot}
                        onSelect={setSelectedSlot}
                        loading={slotsLoading}
                      />
                      <Button
                        type="button"
                        disabled={!canContinueStep1}
                        onClick={() => goTo(2)}
                      >
                        Continue
                      </Button>
                    </>
                  ) : null}

                  {step === 2 ? (
                    <>
                      <div className="max-h-[min(22rem,50svh)] space-y-4 overflow-y-auto overscroll-contain pr-1">
                        <IntakeForm
                          guestName={guestName}
                          guestEmail={guestEmail}
                          serviceType={serviceType}
                          projectBrief={projectBrief}
                          onChange={(patch) => {
                            if (patch.guestName !== undefined)
                              setGuestName(patch.guestName);
                            if (patch.guestEmail !== undefined)
                              setGuestEmail(patch.guestEmail);
                            if (patch.serviceType !== undefined)
                              setServiceType(patch.serviceType);
                            if (patch.projectBrief !== undefined)
                              setProjectBrief(patch.projectBrief);
                          }}
                        />
                        <label className="block">
                          <span className="text-sm font-medium text-[var(--ln-muted)]">
                            Attachment (optional, max 5MB)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.zip,.png,.jpg,.jpeg,.txt"
                            className="mt-2 block w-full text-sm text-[var(--ln-muted)] file:mr-3 file:border file:border-[var(--ln-hairline)] file:bg-[var(--ln-plane)] file:px-3 file:py-1.5 file:text-[var(--ln-ink)]"
                            onChange={(e) =>
                              setFile(e.target.files?.[0] ?? null)
                            }
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => goTo(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          disabled={!canContinueStep2}
                          onClick={() => goTo(3)}
                        >
                          Continue
                        </Button>
                      </div>
                    </>
                  ) : null}

                  {step === 3 ? (
                    <>
                      <ul className="space-y-2 text-sm text-[var(--ln-muted)]">
                        <li>
                          <strong className="text-[var(--ln-ink)]">When:</strong>{" "}
                          {selectedLabel}
                        </li>
                        <li>
                          <strong className="text-[var(--ln-ink)]">
                            Service:
                          </strong>{" "}
                          {serviceType}
                        </li>
                        <li>
                          <strong className="text-[var(--ln-ink)]">Name:</strong>{" "}
                          <span className="text-[var(--ln-mark)]">
                            {guestName}
                          </span>
                        </li>
                        <li>
                          <strong className="text-[var(--ln-ink)]">
                            Email:
                          </strong>{" "}
                          {guestEmail}
                        </li>
                        {file ? (
                          <li>
                            <strong className="text-[var(--ln-ink)]">
                              File:
                            </strong>{" "}
                            {file.name}
                          </li>
                        ) : null}
                      </ul>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => goTo(2)}
                        >
                          Back
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Booking…" : "Confirm consultation"}
                        </Button>
                      </div>
                    </>
                  ) : null}

                  {error ? (
                    <p className="text-sm text-[var(--ln-halt)]" role="alert">
                      {error}
                    </p>
                  ) : null}
                </BookingStage>
              </form>
            </div>

            <div className="relative hidden min-h-[14rem] lg:block">
              <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-signal)] uppercase">
                Desk instrument · step {String(step).padStart(2, "0")}
              </p>
              <BookingInstrument />
            </div>
          </div>

          {/* Mobile instrument — compact, below form, not obstructive */}
          <div className="mt-8 border-t border-[var(--ln-hairline)] pt-6 lg:hidden">
            <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-signal)] uppercase">
              Desk instrument · step {String(step).padStart(2, "0")}
            </p>
            <BookingInstrument />
          </div>
        </div>
      </BookingDeskShell>
    </BookingDeskProvider>
  );
}
