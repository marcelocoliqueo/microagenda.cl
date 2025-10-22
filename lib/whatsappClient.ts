import { sendWhatsAppMessageMock } from "./whatsappMock";

const WHATSAPP_ID = process.env.WHATSAPP_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; mock?: boolean; data?: any; error?: any }> {
  // En desarrollo o sin credenciales, usar mock
  if (
    process.env.NODE_ENV === "development" ||
    !WHATSAPP_ID ||
    !WHATSAPP_TOKEN
  ) {
    return sendWhatsAppMessageMock(to, message);
  }

  // Producción: usar WhatsApp Cloud API
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${WHATSAPP_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace("+", ""),
          type: "text",
          text: { body: message },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return { success: false, error };
  }
}

export function getAppointmentReminderMessage(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
}): string {
  return `Hola ${params.clientName}, te recordamos tu cita:

📅 ${params.date} a las ${params.time}
💼 Servicio: ${params.serviceName}
👤 ${params.businessName}

¡Te esperamos!`;
}

export function getAppointmentConfirmationMessage(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
}): string {
  return `¡Hola ${params.clientName}! Tu cita ha sido confirmada ✅

📅 ${params.date} a las ${params.time}
💼 Servicio: ${params.serviceName}
👤 ${params.businessName}

Nos vemos pronto.`;
}
