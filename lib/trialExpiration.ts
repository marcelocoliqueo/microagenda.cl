import { createClient } from "@supabase/supabase-js";
import { getTrialExpiredEmail } from "./emailTemplates";
import { Resend } from "resend";
import { PLAN_PRICE, formatCurrency } from "./constants";

// Configuración
const TRIAL_DAYS = 3;

// Cliente Supabase Admin (Service Role para bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Cliente Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function checkAndExpireTrials() {
    const errors: string[] = [];
    let expiredCount = 0;
    const debugLogs: any[] = [];

    try {
        // 1. Calcular fecha límite (hace X días)
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - TRIAL_DAYS);

        console.log(`🔍 Buscando trials creados antes de: ${thresholdDate.toISOString()}`);

        // 2. Buscar usuarios en trial creados antes de la fecha límite
        const { data: expiredUsers, error: fetchError } = await supabase
            .from("profiles")
            .select("id, email, name, created_at")
            .eq("subscription_status", "trial")
            .lt("created_at", thresholdDate.toISOString());

        if (fetchError) {
            throw new Error(`Error fetching expired trials: ${fetchError.message}`);
        }

        if (!expiredUsers || expiredUsers.length === 0) {
            console.log("✅ No se encontraron trials vencidos.");
            return { expiredCount: 0, errors: [], debug: debugLogs };
        }

        console.log(`found ${expiredUsers.length} expired trials`);

        // 3. Procesar cada usuario
        for (const user of expiredUsers) {
            try {
                console.log(`Processing expired trial for user: ${user.email}`);

                // Actualizar estado a 'expired'
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ subscription_status: "expired" })
                    .eq("id", user.id);

                if (updateError) {
                    throw new Error(`Error updating profile status: ${updateError.message}`);
                }

                // Enviar email
                if (user.email) {
                    try {
                        await resend.emails.send({
                            from: "MicroAgenda <no-reply@microagenda.cl>",
                            to: user.email,
                            subject: "Tu periodo de prueba ha terminado",
                            html: getTrialExpiredEmail({
                                userName: user.name,
                                planPrice: formatCurrency(PLAN_PRICE)
                            })
                        });
                        console.log(`Email sent to ${user.email}`);
                    } catch (emailError: any) {
                        console.error(`Error sending email to ${user.email}:`, emailError);
                        // No fallamos todo el proceso si falla el email, pero lo logueamos
                        errors.push(`Email failed for ${user.email}: ${emailError.message}`);
                    }
                }

                expiredCount++;
                debugLogs.push({ userId: user.id, email: user.email, status: "expired" });

            } catch (err: any) {
                console.error(`Error processing user ${user.id}:`, err);
                errors.push(`Error processing user ${user.id}: ${err.message}`);
            }
        }

        return { expiredCount, errors, debug: debugLogs };

    } catch (error: any) {
        console.error("Critical error in checkAndExpireTrials:", error);
        return { expiredCount: 0, errors: [error.message], debug: debugLogs };
    }
}
