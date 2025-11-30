import { NextRequest, NextResponse } from "next/server";
import { checkAndExpireTrials } from "@/lib/trialExpiration";

/**
 * Endpoint para verificar y expirar trials vencidos
 *
 * Este endpoint debe ser llamado por un cron job diariamente.
 *
 * Seguridad:
 * - Usa CRON_SECRET para autenticar requests
 * - Solo permite POST requests
 */

export async function POST(req: NextRequest) {
    try {
        // Verificar autorización del cron job
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            console.error("❌ CRON_SECRET no está configurado");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            console.error("❌ Intento de acceso no autorizado al cron job");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Ejecutar verificación de trials
        console.log("🔄 Iniciando verificación de trials vencidos...");
        const startTime = Date.now();

        const result = await checkAndExpireTrials();

        const duration = Date.now() - startTime;

        // Log de resultados
        console.log("✅ Verificación de trials completada:", {
            duration: `${duration}ms`,
            expiredCount: result.expiredCount,
            errors: result.errors.length,
        });

        if (result.errors.length > 0) {
            console.error("⚠️ Errores durante la verificación:", result.errors);
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            duration,
            expiredCount: result.expiredCount,
            errors: result.errors,
            debug: result.debug
        });
    } catch (error: any) {
        console.error("❌ Error en cron job de trials:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

// Bloquear otros métodos HTTP
export async function GET() {
    return NextResponse.json(
        { error: "Method not allowed. Use POST." },
        { status: 405 }
    );
}
