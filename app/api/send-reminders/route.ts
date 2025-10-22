import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendEmail, getAppointmentReminderEmail } from "@/lib/resendClient";
import {
  sendWhatsAppMessage,
  getAppointmentReminderMessage,
} from "@/lib/whatsappClient";
import { formatDate, formatTime } from "@/lib/utils";

// Este endpoint puede ser llamado por un cron job (ej: Vercel Cron)
// Para enviar recordatorios automáticos

export async function POST(request: NextRequest) {
  try {
    // Verificar autorización (puedes usar un secret token)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Buscar citas para mañana que estén confirmadas
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(*),
        profile:profiles(*)
      `
      )
      .eq("date", tomorrowDate)
      .eq("status", "confirmed");

    if (error) throw error;

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        status: "success",
        message: "No appointments to remind",
        count: 0,
      });
    }

    let sentCount = 0;
    let errorCount = 0;

    // Enviar recordatorios
    for (const appointment of appointments) {
      try {
        const businessName =
          appointment.profile?.business_name || appointment.profile?.name || "MicroAgenda";

        const reminderData = {
          clientName: appointment.client_name,
          serviceName: appointment.service?.name || "Servicio",
          date: formatDate(appointment.date),
          time: formatTime(appointment.time),
          businessName,
        };

        // Enviar email (si hay email disponible - agregar campo si es necesario)
        // Por ahora solo WhatsApp

        // Enviar WhatsApp
        const whatsappResult = await sendWhatsAppMessage(
          appointment.client_phone,
          getAppointmentReminderMessage(reminderData)
        );

        if (whatsappResult.success) {
          sentCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error("Error sending reminder:", err);
        errorCount++;
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Reminders sent",
      total: appointments.length,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error("Send reminders error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Send reminders endpoint - use POST to trigger"
    },
    { status: 200 }
  );
}
