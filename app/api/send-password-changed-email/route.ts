import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getPasswordChangedEmail } from "@/lib/resendClient";
import { formatDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName } = await request.json();

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: "Email y nombre de usuario son requeridos" },
        { status: 400 }
      );
    }

    const emailHtml = getPasswordChangedEmail({
      userName,
      changeDate: formatDate(new Date()),
    });

    const result = await sendEmail({
      to: userEmail,
      subject: "Contraseña Actualizada - MicroAgenda",
      html: emailHtml,
    });

    if (!result.success) {
      console.error("Error enviando email de cambio de contraseña:", result.error);
      return NextResponse.json(
        { error: "Error enviando email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en send-password-changed-email:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

