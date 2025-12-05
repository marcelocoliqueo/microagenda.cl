/**
 * Script para crear un pago de prueba y simular webhook
 * 
 * Este script:
 * 1. Crea un pago de prueba usando la API de MercadoPago
 * 2. Usa el MCP para simular el webhook con ese payment_id
 */

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

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const USER_EMAIL = "marcelo.coliqueo@gmail.com";
const USER_ID = "5c803d60-e361-4924-9d7b-ed4e78917d91";
const PLAN_ID = "fb0363f2-3dc2-4ddb-b448-e7e32663b74c";
const PLAN_PRICE = 8500;

async function createTestPayment() {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.error("❌ MERCADOPAGO_ACCESS_TOKEN no configurado");
    console.log("\n💡 Para probar con un pago real:");
    console.log("   1. Ve a tu app en MercadoPago Developer");
    console.log("   2. Crea un pago de prueba desde la UI");
    console.log("   3. Obtén el payment_id del pago");
    console.log("   4. Usa ese payment_id con el MCP simulate_webhook\n");
    return null;
  }

  try {
    console.log("🔄 Creando pago de prueba en MercadoPago...\n");

    // Crear un pago de prueba usando la API de MercadoPago
    const response = await fetch(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_amount: PLAN_PRICE,
          description: "Test payment for subscription renewal",
          payment_method_id: "visa",
          payer: {
            email: USER_EMAIL,
          },
          external_reference: USER_ID,
          metadata: {
            user_id: USER_ID,
            plan_id: PLAN_ID,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error creando pago:", data);
      return null;
    }

    console.log("✅ Pago de prueba creado:");
    console.log(`   Payment ID: ${data.id}`);
    console.log(`   Status: ${data.status}\n`);

    return data.id.toString();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return null;
  }
}

async function main() {
  console.log("🚀 Script de Prueba de Renovación con MercadoPago MCP\n");
  console.log("=" .repeat(50));
  console.log("");

  // Intentar crear un pago de prueba
  const paymentId = await createTestPayment();

  if (!paymentId) {
    console.log("📋 Alternativa: Usar un payment_id existente\n");
    console.log("Si ya tienes un pago de prueba en MercadoPago:");
    console.log("1. Ve a MercadoPago Developer → Actividad");
    console.log("2. Encuentra un pago de prueba");
    console.log("3. Copia el Payment ID");
    console.log("4. Usa el MCP simulate_webhook con ese ID\n");
    
    console.log("💡 O prueba desde la UI:");
    console.log("   1. Inicia sesión en microagenda.cl");
    console.log("   2. Click en 'Reactivar Suscripción'");
    console.log("   3. Usa tarjeta de prueba: 4509 9535 6623 3704");
    console.log("   4. El webhook se procesará automáticamente\n");
    return;
  }

  console.log("✅ Ahora puedes usar el MCP para simular el webhook:");
  console.log(`   Payment ID: ${paymentId}`);
  console.log("\n💡 Ejecuta:");
  console.log(`   mcp_mercadopago-mcp-server_simulate_webhook({`);
  console.log(`     resource_id: "${paymentId}",`);
  console.log(`     topic: "payment",`);
  console.log(`     callback_env_production: false`);
  console.log(`   })\n`);
}

main();

