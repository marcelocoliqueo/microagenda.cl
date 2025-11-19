import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resendClient";

/**
 * API Route helper para enviar emails desde el cliente
 * 
 * Uso:
 * await fetch('/api/send-email', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ to, subject, html })
 * })
 */
export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "to, subject y html son requeridos" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject,
      html,
      from,
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
    console.error("Error en send-email API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

