import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  sendEmail,
  getAppointmentReminderEmail,
  getTwoHourReminderEmail,
} from "@/lib/resendClient";
import { formatDate, formatTime } from "@/lib/constants";

/**
 * Sistema de recordatorios automáticos
 *
 * Envía recordatorios en dos momentos:
 * 1. 24 horas antes de la cita
 * 2. 2 horas antes de la cita
 *
 * Este endpoint debe ser llamado cada hora por el cron job
 */

export async function POST(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("❌ CRON_SECRET no está configurado");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Intento de acceso no autorizado al endpoint de recordatorios");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔔 Iniciando proceso de recordatorios...");

    // Resultados
    let sent24h = 0;
    let sent2h = 0;
    let errors = 0;

    // 1. RECORDATORIOS DE 24 HORAS
    // Solo enviar a las 12:00 UTC (aprox 9:00 AM Chile) para evitar spam cada hora
    const currentHour = new Date().getUTCHours();
    const isTargetHour = currentHour === 12; // 12:00 UTC

    if (isTargetHour) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split("T")[0];

      const { data: appointments24h, error: error24h } = await supabase
        .from("appointments")
        .select(
          `
          *,
          service:services(*),
          profile:profiles(*)
        `
        )
        .eq("date", tomorrowDate)
        .in("status", ["confirmed", "pending"]);

      if (error24h) {
        console.error("Error fetching 24h appointments:", error24h);
        throw error24h;
      }

      if (appointments24h && appointments24h.length > 0) {
        console.log(`📧 Enviando ${appointments24h.length} recordatorios de 24 horas...`);

        for (const appointment of appointments24h) {
          try {
            // Validar que tenga email
            if (!appointment.client_email) {
              console.warn(`⚠️ Cita ${appointment.id} sin email. Se omite recordatorio 24h.`);
              continue;
            }

            const businessName =
              appointment.profile?.business_name ||
              appointment.profile?.name ||
              "MicroAgenda";

            const reminderData = {
              clientName: appointment.client_name,
              serviceName: appointment.service?.name || "Servicio",
              date: formatDate(appointment.date),
              time: formatTime(appointment.time),
              businessName,
            };

            // Enviar email de recordatorio 24h
            const emailResult = await sendEmail({
              to: appointment.client_email,
              subject: `Recordatorio: ${reminderData.serviceName} mañana a las ${reminderData.time}`,
              html: getAppointmentReminderEmail(reminderData),
            });

            if (emailResult.success) {
              sent24h++;
            } else {
              errors++;
              console.error(`Error enviando recordatorio 24h para cita ${appointment.id}`);
            }
          } catch (err) {
            console.error("Error procesando recordatorio 24h:", err);
            errors++;
          }
        }
      }
    } else {
      console.log(`⏳ Hora actual (${currentHour} UTC) no es la hora de envío de recordatorios 24h (12 UTC). Saltando...`);
    }


    // 2. RECORDATORIOS DE 2 HORAS
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const today = now.toISOString().split("T")[0];

    // Obtener todas las citas de hoy
    const { data: todayAppointments, error: errorToday } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:services(*),
        profile:profiles(*)
      `
      )
      .eq("date", today)
      .in("status", ["confirmed", "pending"]);

    if (errorToday) {
      console.error("Error fetching today appointments:", errorToday);
      throw errorToday;
    }

    if (todayAppointments && todayAppointments.length > 0) {
      // Filtrar las que están entre 2-3 horas desde ahora
      const appointments2h = todayAppointments.filter((apt) => {
        const [hours, minutes] = apt.time.split(":").map(Number);
        const aptTime = new Date(now);
        aptTime.setHours(hours, minutes, 0, 0);

        const timeDiff = aptTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Recordatorio entre 2 y 3 horas antes
        return hoursDiff >= 2 && hoursDiff < 3;
      });

      if (appointments2h.length > 0) {
        console.log(`📧 Enviando ${appointments2h.length} recordatorios de 2 horas...`);

        for (const appointment of appointments2h) {
          try {
            if (!appointment.client_email) {
              console.warn(`⚠️ Cita ${appointment.id} sin email. Se omite recordatorio 2h.`);
              continue;
            }

            const businessName =
              appointment.profile?.business_name ||
              appointment.profile?.name ||
              "MicroAgenda";

            const reminderData = {
              clientName: appointment.client_name,
              serviceName: appointment.service?.name || "Servicio",
              date: formatDate(appointment.date),
              time: formatTime(appointment.time),
              businessName,
            };

            // Enviar email de recordatorio 2h
            const emailResult = await sendEmail({
              to: appointment.client_email,
              subject: `¡Tu cita es en 2 horas! - ${reminderData.serviceName}`,
              html: getTwoHourReminderEmail(reminderData),
            });

            if (emailResult.success) {
              sent2h++;
            } else {
              errors++;
              console.error(`Error enviando recordatorio 2h para cita ${appointment.id}`);
            }
          } catch (err) {
            console.error("Error procesando recordatorio 2h:", err);
            errors++;
          }
        }
      }
    }

    const result = {
      status: "success",
      timestamp: new Date().toISOString(),
      reminders: {
        sent24h,
        sent2h,
        total: sent24h + sent2h,
      },
      errors,
    };

    console.log("✅ Proceso de recordatorios completado:", result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ Error crítico en send-reminders:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
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
