import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
    sendEmail,
    getAppointmentRescheduledClientEmail,
    getAppointmentRescheduledProfessionalEmail,
} from "@/lib/resendClient";
import { formatDate, formatTime } from "@/lib/constants";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { appointmentId, newDate, newTime } = body;

        if (!appointmentId || !newDate || !newTime) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Obtener la cita actual con todos los datos necesarios
        const { data: appointment, error: fetchError } = await supabase
            .from("appointments")
            .select(`
        *,
        service:services(*),
        profile:profiles(*)
      `)
            .eq("id", appointmentId)
            .single();

        if (fetchError || !appointment) {
            console.error("Error fetching appointment:", fetchError);
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        // Guardar fecha/hora antigua para los emails
        const oldDate = appointment.date;
        const oldTime = appointment.time;

        // Actualizar la cita con la nueva fecha/hora
        const { error: updateError } = await supabase
            .from("appointments")
            .update({
                date: newDate,
                time: newTime + ":00", // Asegurar formato HH:MM:SS
            })
            .eq("id", appointmentId);

        if (updateError) {
            console.error("Error updating appointment:", updateError);
            return NextResponse.json(
                { error: "Failed to update appointment" },
                { status: 500 }
            );
        }

        console.log(`✅ Cita ${appointmentId} reagendada de ${oldDate} ${oldTime} a ${newDate} ${newTime}`);

        // Preparar datos para los emails
        const businessName = appointment.profile?.business_name || appointment.profile?.name || "MicroAgenda";
        const professionalName = appointment.profile?.name || "Profesional";
        const serviceName = appointment.service?.name || "Servicio";

        // Enviar email al cliente (si tiene email)
        if (appointment.client_email) {
            try {
                const clientEmailHtml = getAppointmentRescheduledClientEmail({
                    clientName: appointment.client_name,
                    serviceName,
                    oldDate: formatDate(oldDate),
                    oldTime: formatTime(oldTime),
                    newDate: formatDate(newDate),
                    newTime: formatTime(newTime),
                    businessName,
                    businessPhone: appointment.profile?.business_phone,
                });

                await sendEmail({
                    to: appointment.client_email,
                    subject: `Cita Reagendada - ${businessName}`,
                    html: clientEmailHtml,
                });

                console.log(`📧 Email de reagendamiento enviado al cliente: ${appointment.client_email}`);
            } catch (emailError) {
                console.error("Error enviando email al cliente:", emailError);
                // No fallar el flujo si el email falla
            }
        }

        // Enviar email al profesional
        if (appointment.profile?.email) {
            try {
                const professionalEmailHtml = getAppointmentRescheduledProfessionalEmail({
                    professionalName,
                    clientName: appointment.client_name,
                    clientPhone: appointment.client_phone,
                    serviceName,
                    oldDate: formatDate(oldDate),
                    oldTime: formatTime(oldTime),
                    newDate: formatDate(newDate),
                    newTime: formatTime(newTime),
                });

                await sendEmail({
                    to: appointment.profile.email,
                    subject: `Cita Reagendada - ${appointment.client_name}`,
                    html: professionalEmailHtml,
                });

                console.log(`📧 Email de reagendamiento enviado al profesional: ${appointment.profile.email}`);
            } catch (emailError) {
                console.error("Error enviando email al profesional:", emailError);
                // No fallar el flujo si el email falla
            }
        }

        return NextResponse.json({
            success: true,
            message: "Appointment rescheduled successfully",
            oldDate,
            oldTime,
            newDate,
            newTime,
        });
    } catch (error: any) {
        console.error("Reschedule error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: "Reschedule appointment endpoint - use POST" },
        { status: 200 }
    );
}
