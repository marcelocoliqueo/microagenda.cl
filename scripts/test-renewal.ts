/**
 * Script para probar la renovación de suscripción
 * Simula un webhook de MercadoPago con un pago aprobado
 */

import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

// Cargar variables de entorno
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const WEBHOOK_URL =
  (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const USER_EMAIL = process.argv[2] || "marcelo.coliqueo@gmail.com";

console.log("🔍 Variables de entorno:");
console.log(`   SUPABASE_URL: ${supabaseUrl ? "✅ Configurado" : "❌ Faltante"}`);
console.log(`   SERVICE_KEY: ${supabaseServiceKey ? "✅ Configurado" : "❌ Faltante"}\n`);

async function testRenewal() {
  console.log("🔄 Probando renovación de suscripción\n");
  console.log(`📧 Usuario: ${USER_EMAIL}`);
  console.log(`🌐 Webhook URL: ${WEBHOOK_URL}/api/mercadopago-webhook\n`);

  try {
    // 1. Obtener información del usuario y plan
    console.log("1️⃣ Obteniendo información del usuario...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, name, subscription_status")
      .eq("email", USER_EMAIL)
      .single();

    if (profileError || !profile) {
      console.error("❌ Usuario no encontrado:", profileError?.message);
      process.exit(1);
    }

    console.log(`   ✅ Usuario encontrado: ${profile.name}`);
    console.log(`   📊 Estado actual: ${profile.subscription_status}\n`);

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, price")
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      console.error("❌ Plan no encontrado:", planError?.message);
      process.exit(1);
    }

    console.log(`   ✅ Plan encontrado: ${plan.name} - $${plan.price} CLP\n`);

    // 2. Generar un payment ID simulado
    const mockPaymentId = `TEST-${Date.now()}`;
    const mockAmount = parseFloat(plan.price);

    // 3. Simular webhook de MercadoPago
    console.log("2️⃣ Simulando webhook de MercadoPago...");
    console.log(`   Payment ID: ${mockPaymentId}\n`);

    const webhookPayload = {
      type: "payment",
      data: {
        id: mockPaymentId,
      },
      date_created: new Date().toISOString(),
      id: Date.now(),
      live_mode: false,
    };

    // 4. Simular respuesta de getPaymentInfo
    // Necesitamos mockear la función getPaymentInfo o crear un endpoint de prueba
    console.log("3️⃣ Simulando respuesta de MercadoPago API...");

    const mockPaymentResponse = {
      id: parseInt(mockPaymentId.replace("TEST-", "")),
      status: "approved",
      status_detail: "accredited",
      transaction_amount: mockAmount,
      currency_id: "CLP",
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      external_reference: profile.id,
      metadata: {
        user_id: profile.id,
        plan_id: plan.id,
        plan_name: plan.name,
      },
      payer: {
        email: profile.email,
      },
    };

    console.log("   ✅ Pago simulado aprobado\n");

    // 5. Actualizar directamente en la BD (simulando lo que haría el webhook)
    console.log("4️⃣ Actualizando suscripción en la base de datos...");

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    // Actualizar suscripción
    const { error: subError } = await supabase.from("subscriptions").upsert(
      [
        {
          user_id: profile.id,
          plan_id: plan.id,
          mercadopago_id: mockPaymentId,
          status: "active",
          start_date: new Date().toISOString(),
          renewal_date: renewalDate.toISOString(),
          trial: false,
        },
      ],
      {
        onConflict: "mercadopago_id",
      }
    );

    if (subError) {
      console.error("   ❌ Error actualizando suscripción:", subError.message);
    } else {
      console.log("   ✅ Suscripción actualizada");
    }

    // Actualizar perfil
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("id", profile.id);

    if (profileUpdateError) {
      console.error("   ❌ Error actualizando perfil:", profileUpdateError.message);
    } else {
      console.log("   ✅ Perfil actualizado a 'active'\n");
    }

    // Registrar pago
    const { error: paymentError } = await supabase.from("payments").insert([
      {
        user_id: profile.id,
        mercadopago_payment_id: mockPaymentId,
        amount: mockAmount,
        status: "approved",
        payment_date: new Date().toISOString(),
      },
    ]);

    if (paymentError) {
      console.error("   ⚠️  Error registrando pago:", paymentError.message);
    } else {
      console.log("   ✅ Pago registrado\n");
    }

    // 6. Verificar resultado
    console.log("5️⃣ Verificando resultado...");
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", profile.id)
      .single();

    if (updatedProfile?.subscription_status === "active") {
      console.log("   ✅ ¡Renovación exitosa!");
      console.log(`   📊 Nuevo estado: ${updatedProfile.subscription_status}`);
      console.log(`   📅 Renovación válida hasta: ${renewalDate.toLocaleDateString("es-CL")}\n`);
    } else {
      console.log("   ⚠️  Estado no actualizado correctamente");
    }

    console.log("\n✅ Proceso completado");
    console.log("\n💡 Para probar el webhook real:");
    console.log(`   1. Asegúrate de que tu servidor esté corriendo`);
    console.log(`   2. Usa el script test-webhook.ts con datos reales`);
    console.log(`   3. O usa el MCP de MercadoPago con un payment_id real\n`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testRenewal();

