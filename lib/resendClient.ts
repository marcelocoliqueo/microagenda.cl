import { Resend } from "resend";

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

export function getAppointmentReminderEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recordatorio de Cita</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${params.clientName}</strong>,</p>
            <p>Este es un recordatorio de tu cita próxima:</p>
            <ul>
              <li><strong>Servicio:</strong> ${params.serviceName}</li>
              <li><strong>Fecha:</strong> ${params.date}</li>
              <li><strong>Hora:</strong> ${params.time}</li>
              <li><strong>Profesional:</strong> ${params.businessName}</li>
            </ul>
            <p>Te esperamos puntualmente.</p>
            <p>Si necesitas cancelar o reprogramar, por favor contáctanos con anticipación.</p>
          </div>
          <div class="footer">
            <p>Este email fue enviado por MicroAgenda</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getAppointmentConfirmationEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; }
          .footer { text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Cita Confirmada!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${params.clientName}</strong>,</p>
            <p>Tu cita ha sido confirmada exitosamente:</p>
            <ul>
              <li><strong>Servicio:</strong> ${params.serviceName}</li>
              <li><strong>Fecha:</strong> ${params.date}</li>
              <li><strong>Hora:</strong> ${params.time}</li>
              <li><strong>Profesional:</strong> ${params.businessName}</li>
            </ul>
            <p>¡Te esperamos!</p>
          </div>
          <div class="footer">
            <p>Este email fue enviado por MicroAgenda</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
