import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resendClient";
import {
  getAppointmentManuallyConfirmedEmail,
  getAppointmentCancellationClientEmail,
  getAppointmentCancellationProfessionalEmail,
  getAppointmentRescheduledClientEmail,
  getAppointmentRescheduledProfessionalEmail,
  getAppointmentConfirmationEmail,
  getAppointmentCompletedEmail,
  getNoShowNotificationEmail,
} from "@/lib/emailTemplates";
import { supabase } from "@/lib/supabaseClient";
import { formatDateFriendly } from "@/lib/utils";

/**
 * API Route para enviar emails relacionados con citas
 * 
 * Tipos soportados:
 * - manual-confirmation: Cuando el profesional confirma manualmente una cita pendiente
 * - cancellation-client: Notificación de cancelación al cliente
 * - cancellation-professional: Notificación de cancelación al profesional
 * - rescheduled-client: Notificación de reagendamiento al cliente
 * - rescheduled-professional: Notificación de reagendamiento al profesional
 */
export async function POST(request: NextRequest) {
  try {
    const { type, appointmentId, oldData } = await request.json();

    if (!type || !appointmentId) {
      return NextResponse.json(
        { error: "type y appointmentId son requeridos" },
        { status: 400 }
      );
    }

    // Obtener datos de la cita
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services(*),
        profile:profiles(*)
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const service = appointment.service as any;
    const profile = appointment.profile as any;

    let emailHtml: string;
    let subject: string;
    let to: string;

    switch (type) {
      case "manual-confirmation": {
        // Email al cliente cuando el profesional confirma manualmente
        if (!appointment.client_phone && !appointment.client_email) {
          return NextResponse.json(
            { error: "Cliente no tiene email o teléfono" },
            { status: 400 }
          );
        }

        // Si no tiene email, no podemos enviar email
        if (!appointment.client_email) {
          return NextResponse.json(
            { success: true, skipped: true, reason: "Cliente no tiene email" }
          );
        }

        emailHtml = getAppointmentManuallyConfirmedEmail({
          clientName: appointment.client_name,
          serviceName: service?.name || "Servicio",
          date: formatDateFriendly(appointment.date),
          time: appointment.time.substring(0, 5),
          businessName: profile?.business_name || profile?.name || "Profesional",
        });

        subject = "¡Tu Cita ha sido Confirmada!";
        to = appointment.client_email;
        break;
      }

      case "cancellation-client": {
        if (!appointment.client_email) {
          return NextResponse.json(
            { success: true, skipped: true, reason: "Cliente no tiene email" }
          );
        }

        emailHtml = getAppointmentCancellationClientEmail({
          clientName: appointment.client_name,
          serviceName: service?.name || "Servicio",
          date: formatDateFriendly(appointment.date),
          time: appointment.time.substring(0, 5),
          businessName: profile?.business_name || profile?.name || "Profesional",
          cancelledBy: "professional",
        });

        subject = "Cita Cancelada";
        to = appointment.client_email;
        break;
      }

      case "cancellation-professional": {
        emailHtml = getAppointmentCancellationProfessionalEmail({
          professionalName: profile?.name || "Profesional",
          clientName: appointment.client_name,
          clientPhone: appointment.client_phone || "No disponible",
          serviceName: service?.name || "Servicio",
          date: formatDateFriendly(appointment.date),
          time: appointment.time.substring(0, 5),
          cancelledBy: "client",
        });

        subject = "Cita Cancelada";
        to = profile?.email;
        break;
      }

      case "rescheduled-client": {
        if (!appointment.client_email || !oldData) {
          return NextResponse.json(
            { error: "client_email y oldData son requeridos" },
            { status: 400 }
          );
        }

        emailHtml = getAppointmentRescheduledClientEmail({
          clientName: appointment.client_name,
          serviceName: service?.name || "Servicio",
          oldDate: formatDateFriendly(oldData.date),
          oldTime: oldData.time.substring(0, 5),
          newDate: formatDateFriendly(appointment.date),
          newTime: appointment.time.substring(0, 5),
          businessName: profile?.business_name || profile?.name || "Profesional",
        });

        subject = "Cita Reagendada";
        to = appointment.client_email;
        break;
      }

      case "rescheduled-professional": {
        if (!oldData) {
          return NextResponse.json(
            { error: "oldData es requerido" },
            { status: 400 }
          );
        }

        emailHtml = getAppointmentRescheduledProfessionalEmail({
          professionalName: profile?.name || "Profesional",
          clientName: appointment.client_name,
          clientPhone: appointment.client_phone || "No disponible",
          serviceName: service?.name || "Servicio",
          oldDate: formatDateFriendly(oldData.date),
          oldTime: oldData.time.substring(0, 5),
          newDate: formatDateFriendly(appointment.date),
          newTime: appointment.time.substring(0, 5),
        });

        subject = "Cita Reagendada";
        to = profile?.email;
        break;
      }

      case "completed": {
        // Verificar si el profesional tiene activado el envío de reviews
        if (!profile?.send_review_request) {
          return NextResponse.json(
            { success: true, skipped: true, reason: "Review request desactivado" }
          );
        }

        if (!appointment.client_email) {
          return NextResponse.json(
            { success: true, skipped: true, reason: "Cliente no tiene email" }
          );
        }

        emailHtml = getAppointmentCompletedEmail({
          clientName: appointment.client_name,
          serviceName: service?.name || "Servicio",
          date: formatDateFriendly(appointment.date),
          time: appointment.time.substring(0, 5),
          businessName: profile?.business_name || profile?.name || "Profesional",
          reviewLink: undefined, // Opcional: agregar link de review en el futuro
        });

        subject = "¡Gracias por tu visita!";
        to = appointment.client_email;
        break;
      }

      case "no-show": {

        emailHtml = getNoShowNotificationEmail({
          professionalName: profile?.name || "Profesional",
          clientName: appointment.client_name,
          serviceName: service?.name || "Servicio",
          date: formatDateFriendly(appointment.date),
          time: appointment.time.substring(0, 5),
        });

        subject = "Cliente No Asistió - Cita Perdida";
        to = profile?.email;
        break;
      }

      default:
        return NextResponse.json(
          { error: "Tipo de email no válido" },
          { status: 400 }
        );
    }

    const result = await sendEmail({
      to,
      subject,
      html: emailHtml,
    });

    if (!result.success) {
      console.error("Error enviando email:", result.error);
      return NextResponse.json(
        { error: "Error enviando email", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mock: result.mock || false
    });
  } catch (error: any) {
    console.error("Error en send-appointment-email API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
