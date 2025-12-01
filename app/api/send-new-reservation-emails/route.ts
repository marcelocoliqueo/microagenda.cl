import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resendClient";
import {
  getClientReservationConfirmationEmail,
  getNewAppointmentNotificationEmail,
} from "@/lib/emailTemplates";
import { supabase } from "@/lib/supabaseClient";
import { formatDateFriendly } from "@/lib/utils";

/**
 * API Route para enviar emails cuando se crea una nueva reserva desde la página pública
 */
export async function POST(request: NextRequest) {
  try {
    const { appointmentId, type } = await request.json();

    if (!appointmentId || !type) {
      return NextResponse.json(
        { error: "appointmentId y type son requeridos" },
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

    if (type === "client") {
      // Email al cliente
      if (!appointment.client_email) {
        return NextResponse.json(
          { success: true, skipped: true, reason: "Cliente no tiene email" }
        );
      }

      emailHtml = getClientReservationConfirmationEmail({
        clientName: appointment.client_name,
        clientEmail: appointment.client_email,
        serviceName: service?.name || "Servicio",
        date: formatDateFriendly(appointment.date),
        time: appointment.time.substring(0, 5),
        businessName: profile?.business_name || profile?.name || "Profesional",
        status: appointment.status as "pending" | "confirmed",
      });

      subject = "Reserva Creada";
      to = appointment.client_email;
    } else if (type === "professional") {
      // Email al profesional
      emailHtml = getNewAppointmentNotificationEmail({
        professionalName: profile?.name || "Profesional",
        clientName: appointment.client_name,
        clientPhone: appointment.client_phone || "No disponible",
        clientEmail: appointment.client_email || undefined,
        serviceName: service?.name || "Servicio",
        date: formatDateFriendly(appointment.date),
        time: appointment.time.substring(0, 5),
        status: appointment.status as "pending" | "confirmed",
        appointmentId: appointment.id,
      });

      subject = "Nueva Reserva Recibida";
      to = profile?.email;
    } else {
      return NextResponse.json(
        { error: "Tipo debe ser 'client' o 'professional'" },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json(
        { error: "Email de destino no encontrado" },
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
    console.error("Error en send-new-reservation-emails API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
