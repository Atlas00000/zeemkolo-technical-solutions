"use client";

import { SERVICE_TYPES } from "./types";

type IntakeFormProps = {
  guestName: string;
  guestEmail: string;
  serviceType: string;
  projectBrief: string;
  onChange: (patch: Partial<{
    guestName: string;
    guestEmail: string;
    serviceType: string;
    projectBrief: string;
  }>) => void;
};

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
        <span className="text-sm font-medium text-brand-steel">Full name</span>
        <input
          value={guestName}
          onChange={(e) => onChange({ guestName: e.target.value })}
          className="mt-2 w-full border border-brand-steel/20 bg-white px-3 py-2 outline-none focus:border-brand-signal"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-brand-steel">Email</span>
        <input
          type="email"
          value={guestEmail}
          onChange={(e) => onChange({ guestEmail: e.target.value })}
          className="mt-2 w-full border border-brand-steel/20 bg-white px-3 py-2 outline-none focus:border-brand-signal"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-brand-steel">Service</span>
        <select
          value={serviceType}
          onChange={(e) => onChange({ serviceType: e.target.value })}
          className="mt-2 w-full border border-brand-steel/20 bg-white px-3 py-2 outline-none focus:border-brand-signal"
        >
          {SERVICE_TYPES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-brand-steel">Project brief</span>
        <textarea
          value={projectBrief}
          onChange={(e) => onChange({ projectBrief: e.target.value })}
          rows={5}
          placeholder="Describe the product, constraints, and what you need from Zeemkolo…"
          className="mt-2 w-full border border-brand-steel/20 bg-white px-3 py-2 outline-none focus:border-brand-signal"
          required
        />
        <span className="mt-1 block text-xs text-brand-steel/60">
          {projectBrief.trim().length}/20 characters minimum
        </span>
      </label>
    </div>
  );
}
