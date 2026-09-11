import { Resend } from "resend";
import { env } from "../config/env.js";
import { buildConsultationIcs } from "./ics-generator.js";

export type ConsultationEmailPayload = {
  consultationId: string;
  guestName: string;
  guestEmail: string;
  serviceType: string;
  projectBrief: string;
  slotStartsAt: Date;
  timezone: string;
};

export type MailResult = {
  sent: boolean;
  skippedReason?: string;
  clientMessageId?: string;
  adminMessageId?: string;
};

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  return new Resend(env.RESEND_API_KEY);
}

export async function sendConsultationConfirmation(
  payload: ConsultationEmailPayload,
): Promise<MailResult> {
  const resend = getResend();
  const ics = buildConsultationIcs({
    id: payload.consultationId,
    title: `Zeemkolo Consultation — ${payload.serviceType}`,
    description: `Consultation with ${payload.guestName}.\n\n${payload.projectBrief}`,
    startsAt: payload.slotStartsAt,
    organizerEmail: env.ADMIN_EMAIL,
    attendeeEmail: payload.guestEmail,
    timezone: payload.timezone,
  });

  const when = payload.slotStartsAt.toISOString();
  const subject = `Consultation confirmed — ${payload.serviceType}`;
  const html = `
    <p>Hi ${payload.guestName},</p>
    <p>Your consultation with <strong>Zeemkolo Technical Solutions</strong> is confirmed.</p>
    <ul>
      <li><strong>Service:</strong> ${payload.serviceType}</li>
      <li><strong>When (UTC):</strong> ${when}</li>
      <li><strong>Timezone:</strong> ${payload.timezone}</li>
    </ul>
    <p>A calendar invite (.ics) is attached.</p>
    <p>— Zeemkolo Technical Solutions</p>
  `;

  if (!resend) {
    return { sent: false, skippedReason: "RESEND_API_KEY not configured" };
  }

  const attachment = {
    filename: "zeemkolo-consultation.ics",
    content: Buffer.from(ics, "utf8"),
  };

  const client = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: payload.guestEmail,
    subject,
    html,
    attachments: [attachment],
  });

  const admin = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: env.ADMIN_EMAIL,
    subject: `[Admin] ${subject}`,
    html: `
      <p>New consultation booking.</p>
      <ul>
        <li><strong>Guest:</strong> ${payload.guestName} (${payload.guestEmail})</li>
        <li><strong>Service:</strong> ${payload.serviceType}</li>
        <li><strong>When:</strong> ${when}</li>
        <li><strong>Brief:</strong> ${payload.projectBrief}</li>
      </ul>
    `,
    attachments: [attachment],
  });

  return {
    sent: true,
    clientMessageId: client.data?.id,
    adminMessageId: admin.data?.id,
  };
}
