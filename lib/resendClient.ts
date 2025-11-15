import { Resend } from "resend";
// Re-export all email templates from the new templates file
export * from "./emailTemplates";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("⚠️ RESEND_API_KEY no configurada. Los emails no se enviarán.");
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
  from = "MicroAgenda <noreply@microagenda.cl>",
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!resend) {
    console.log(`📧 [MOCK EMAIL]\nTo: ${to}\nSubject: ${subject}\n${html}`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
