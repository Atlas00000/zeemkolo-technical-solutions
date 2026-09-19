"use client";

import { SERVICE_TYPES } from "./types";
import { Input } from "@/design/primitives/Input";
import { Text } from "@/design/primitives/Text";

type IntakeFormProps = {
  guestName: string;
  guestEmail: string;
  serviceType: string;
  projectBrief: string;
  onChange: (
    patch: Partial<{
      guestName: string;
      guestEmail: string;
      serviceType: string;
      projectBrief: string;
    }>,
  ) => void;
};

const fieldClass =
  "mt-2 w-full border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-3 py-2 text-sm text-[var(--ln-ink)] outline-none transition-colors focus:border-[var(--ln-signal)] focus:ring-2 focus:ring-[var(--ln-signal)]/30";

export function IntakeForm({
  guestName,
  guestEmail,
  serviceType,
  projectBrief,
  onChange,
}: IntakeFormProps) {
  return (
    <div className="space-y-4">
      <label className="block">
        <Text variant="meta" as="span" className="font-medium text-[var(--ln-muted)]">
          Full name
        </Text>
        <Input
          value={guestName}
          onChange={(e) => onChange({ guestName: e.target.value })}
          className="mt-2"
          required
        />
      </label>

      <label className="block">
        <Text variant="meta" as="span" className="font-medium text-[var(--ln-muted)]">
          Email
        </Text>
        <Input
          type="email"
          value={guestEmail}
          onChange={(e) => onChange({ guestEmail: e.target.value })}
          className="mt-2"
          required
        />
      </label>

      <label className="block">
        <Text variant="meta" as="span" className="font-medium text-[var(--ln-muted)]">
          Service
        </Text>
        <select
          value={serviceType}
          onChange={(e) => onChange({ serviceType: e.target.value })}
          className={fieldClass}
        >
          {SERVICE_TYPES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <Text variant="meta" as="span" className="font-medium text-[var(--ln-muted)]">
          Project brief
        </Text>
        <textarea
          value={projectBrief}
          onChange={(e) => onChange({ projectBrief: e.target.value })}
          rows={5}
          placeholder="Describe the product, constraints, and what you need from Zeemkolo…"
          className={fieldClass}
          required
        />
        <Text variant="meta" className="mt-1">
          {projectBrief.trim().length}/20 characters minimum
        </Text>
      </label>
    </div>
  );
}
