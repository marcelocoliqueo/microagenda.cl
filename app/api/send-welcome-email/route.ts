import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getWelcomeEmail } from "@/lib/resendClient";

/**
 * API Route para enviar email de bienvenida
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, businessName } = await request.json();

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: "userEmail y userName son requeridos" },
        { status: 400 }
      );
    }

    const emailHtml = getWelcomeEmail({
      userName,
      businessName: businessName || undefined,
    });

    const result = await sendEmail({
      to: userEmail,
      subject: `¡Bienvenido a MicroAgenda!`,
      html: emailHtml,
    });

    if (!result.success) {
      console.error("Error enviando email de bienvenida:", result.error);
      return NextResponse.json(
        { error: "Error enviando email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      mock: result.mock || false 
    });
  } catch (error: any) {
    console.error("Error en send-welcome-email API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

