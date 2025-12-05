# Guía de Migración: De Checkout Pro a API de Suscripciones

## 📋 Resumen

Tu implementación actual usa **Checkout Pro (preferences)** que requiere pagos manuales cada mes. Para tener **suscripciones con cobro automático mensual**, debes migrar a la **API de Suscripciones/Preapproval** de MercadoPago.

---

## 🔄 Diferencias Clave

### Implementación Actual (Checkout Pro)

```typescript
POST https://api.mercadopago.com/checkout/preferences
```

**Características:**
- ✅ Usuario paga una vez
- ❌ **NO** se renueva automáticamente
- ❌ Usuario debe volver a pagar manualmente cada mes
- ✅ Recibes webhook `payment` cuando se aprueba

### Implementación Recomendada (Suscripciones API)

```typescript
POST https://api.mercadopago.com/preapproval
```

**Características:**
- ✅ Usuario autoriza débito automático
- ✅ **MercadoPago cobra automáticamente cada mes**
- ✅ Recibes webhooks para cada cobro recurrente
- ✅ Renovación automática
- ✅ Mejor experiencia de usuario y mayor retención

---

## 🛠️ Pasos de Migración

### Opción 1: Suscripción SIN plan asociado (Recomendada para tu caso)

Esta opción es más simple y directa para un único plan mensual.

#### Paso 1: Modificar `createSubscriptionPreference` a `createSubscription`

**Archivo:** `lib/mercadopagoClient.ts`

**Antes (Checkout Pro):**
```typescript
export async function createSubscriptionPreference(params: {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planPrice: number;
}) {
  // ... código que crea una "preference"
  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: `MicroAgenda - Plan ${params.planName} (Mensual)`,
            description: "Suscripción mensual al sistema de agendamiento de citas",
            quantity: 1,
            unit_price: params.planPrice,
            currency_id: "CLP",
          },
        ],
        // ... más configuración
      }),
    }
  );
}
```

**Después (Suscripciones API):**
```typescript
export async function createSubscriptionPreference(params: {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planPrice: number;
}) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.log("📦 [MOCK] Creando suscripción", params);
    return {
      success: true,
      mock: true,
      init_point: `${APP_URL}/dashboard?payment=mock_success`,
    };
  }

  try {
    const response = await fetch(
      "https://api.mercadopago.com/preapproval",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: `MicroAgenda - Plan ${params.planName} (Mensual)`,
          payer_email: params.userEmail,
          external_reference: params.userId,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: params.planPrice,
            currency_id: "CLP",
            start_date: new Date().toISOString(), // Inicia ahora
          },
          back_url: `${APP_URL}/dashboard?payment=success`,
          status: "pending", // La suscripción comienza como "pending" hasta que el usuario la autoriza
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("MercadoPago API error:", data);
      return { success: false, error: data };
    }

    return { success: true, init_point: data.init_point, subscription_id: data.id };
  } catch (error) {
    console.error("MercadoPago error:", error);
    return { success: false, error };
  }
}
```

**Cambios clave:**
1. Endpoint cambia de `/checkout/preferences` a `/preapproval`
2. En lugar de `items`, usas `reason` (título de la suscripción)
3. Configuras `auto_recurring` con:
   - `frequency: 1` y `frequency_type: "months"` para mensual
   - `transaction_amount` y `currency_id`
   - `start_date` (fecha de inicio)
4. La respuesta incluye `init_point` (igual que preferences) para redirigir al usuario

#### Paso 2: Actualizar API Route

**Archivo:** `app/api/create-subscription-preference/route.ts`

Aplica los mismos cambios que en el paso anterior, reemplazando el endpoint y la estructura del body.

#### Paso 3: Actualizar manejo de Webhooks

**Archivo:** `app/api/mercadopago-webhook/route.ts`

**Agregar manejo de eventos de suscripción:**

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, data } = body;

  console.log("Webhook recibido:", { type, data });

  // Webhook de pago único (Checkout Pro) - mantenemos para compatibilidad
  if (type === "payment") {
    // ... código existente ...
  }

  // NUEVO: Webhook de suscripción autorizada
  if (type === "subscription_preapproval") {
    const subscriptionId = data.id;
    console.log(`📝 Suscripción autorizada con ID: ${subscriptionId}`);

    try {
      // Obtener detalles de la suscripción
      const subscriptionInfo = await getSubscriptionInfo(subscriptionId);

      if (!subscriptionInfo || subscriptionInfo.status !== "authorized") {
        console.log(`Suscripción ${subscriptionId} no autorizada o no encontrada.`);
        return NextResponse.json({ message: "Suscripción no autorizada" }, { status: 200 });
      }

      const userId = subscriptionInfo.external_reference;
      const userEmail = subscriptionInfo.payer_email;

      if (!userId || !userEmail) {
        console.error("Datos esenciales faltantes en la suscripción:", { userId, userEmail });
        return NextResponse.json({ error: "Datos esenciales faltantes" }, { status: 400 });
      }

      // Actualizar el perfil del usuario a 'active'
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", userId);

      if (profileUpdateError) {
        console.error("Error al actualizar el perfil:", profileUpdateError);
        return NextResponse.json({ error: "Error al actualizar el perfil" }, { status: 500 });
      }

      console.log(`✅ Perfil del usuario ${userId} actualizado a 'active' (suscripción autorizada).`);

      // Crear entrada en la tabla 'subscriptions'
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      const { error: upsertSubscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan_id: subscriptionInfo.metadata?.plan_id || null,
            mercadopago_id: subscriptionId,
            status: "active",
            start_date: new Date().toISOString(),
            renewal_date: renewalDate.toISOString(),
            trial: false,
          },
          { onConflict: "user_id", ignoreDuplicates: false }
        );

      if (upsertSubscriptionError) {
        console.error("Error al crear/actualizar suscripción:", upsertSubscriptionError);
        return NextResponse.json({ error: "Error al crear/actualizar suscripción" }, { status: 500 });
      }

      console.log(`✅ Suscripción creada/actualizada para usuario ${userId}.`);

      return NextResponse.json({ message: "Webhook de suscripción procesado con éxito" }, { status: 200 });
    } catch (error) {
      console.error("Error al procesar webhook de suscripción:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  }

  // NUEVO: Webhook de cobro automático mensual
  if (type === "subscription_authorized_payment") {
    const paymentId = data.id;
    console.log(`💳 Cobro automático recibido con ID: ${paymentId}`);

    try {
      const paymentInfo = await getPaymentInfo(paymentId);

      if (!paymentInfo || paymentInfo.status !== "approved") {
        console.log(`Pago ${paymentId} no aprobado.`);
        return NextResponse.json({ message: "Pago no aprobado" }, { status: 200 });
      }

      const subscriptionId = paymentInfo.preapproval_id;
      const userId = paymentInfo.external_reference;

      if (!userId || !subscriptionId) {
        console.error("Datos esenciales faltantes en el pago:", { userId, subscriptionId });
        return NextResponse.json({ error: "Datos esenciales faltantes" }, { status: 400 });
      }

      // Actualizar la fecha de renovación
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      const { error: updateSubscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          renewal_date: renewalDate.toISOString(),
        })
        .eq("mercadopago_id", subscriptionId);

      if (updateSubscriptionError) {
        console.error("Error al actualizar suscripción:", updateSubscriptionError);
        return NextResponse.json({ error: "Error al actualizar suscripción" }, { status: 500 });
      }

      console.log(`✅ Suscripción renovada para usuario ${userId}.`);

      // Opcional: Enviar correo de confirmación de renovación
      // ... código de envío de correo ...

      return NextResponse.json({ message: "Webhook de cobro automático procesado con éxito" }, { status: 200 });
    } catch (error) {
      console.error("Error al procesar webhook de cobro automático:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Tipo de webhook no manejado" }, { status: 200 });
}
```

#### Paso 4: Agregar función para obtener info de suscripción

**Archivo:** `lib/mercadopagoClient.ts`

```typescript
export async function getSubscriptionInfo(subscriptionId: string) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.log("📦 [MOCK] Obteniendo info de suscripción", subscriptionId);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Error al obtener info de suscripción:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener info de suscripción:", error);
    return null;
  }
}
```

#### Paso 5: Configurar webhooks en MercadoPago

Asegúrate de que tu aplicación de MercadoPago esté configurada para recibir webhooks de suscripciones. Los topics relevantes son:

- `subscription_preapproval` - Cuando el usuario autoriza la suscripción
- `subscription_authorized_payment` - Cuando MercadoPago cobra automáticamente cada mes

Puedes configurar esto en el [panel de MercadoPago Developer](https://www.mercadopago.cl/developers/panel/app) o usando el MCP tool `save_webhook`.

---

## 🧪 Pruebas

### 1. Modo Sandbox

Asegúrate de usar tu **Access Token de Sandbox** (no el de producción) durante las pruebas.

### 2. Crear suscripción de prueba

1. Haz clic en "Reactivar por..." en tu app
2. Serás redirigido a MercadoPago
3. Inicia sesión con una cuenta de prueba
4. Autoriza la suscripción
5. Verifica que recibes el webhook `subscription_preapproval` con status `authorized`

### 3. Verificar cobros automáticos

MercadoPago cobrará automáticamente cada mes. En sandbox, puedes **simular el paso del tiempo** usando la API de MercadoPago o el MCP.

---

## ⚠️ Consideraciones Importantes

### 1. Migración de usuarios existentes

Los usuarios que ya pagaron con Checkout Pro **no tendrán renovación automática**. Deberás:

- Notificarles que deben "reactivar" su suscripción usando el nuevo flujo
- Ofrecer un período de transición (ej: 1 mes gratis) para incentivarlos a migrar

### 2. Gestión de tarjetas

Con la API de Suscripciones:
- El usuario asocia una tarjeta al autorizar la suscripción
- MercadoPago se encarga de cobrar automáticamente
- Si el cobro falla (tarjeta vencida, fondos insuficientes), recibirás un webhook con status `rejected`

### 3. Cancelaciones

Los usuarios pueden cancelar su suscripción desde:
- Su cuenta de MercadoPago
- Tu aplicación (llamando a la API de MercadoPago para cancelar el `preapproval`)

---

## 📊 Resumen de Cambios en el Código

| Archivo | Cambio |
|---------|--------|
| `lib/mercadopagoClient.ts` | Cambiar endpoint de `/checkout/preferences` a `/preapproval` y estructura del body |
| `app/api/create-subscription-preference/route.ts` | Aplicar mismos cambios que en `mercadopagoClient.ts` |
| `app/api/mercadopago-webhook/route.ts` | Agregar manejo de `subscription_preapproval` y `subscription_authorized_payment` |
| `lib/mercadopagoClient.ts` | Agregar función `getSubscriptionInfo()` |

---

## 🎯 Próximos Pasos

1. **Decide** si quieres migrar a la API de Suscripciones
2. **Prueba** en sandbox antes de subir a producción
3. **Notifica** a tus usuarios actuales sobre el cambio
4. **Configura** webhooks para los nuevos eventos de suscripción
5. **Monitorea** los cobros automáticos y fallos de renovación

---

## 🔗 Referencias

- [Documentación de Suscripciones MercadoPago](https://www.mercadopago.com/developers/es/docs/subscriptions/overview)
- [API Reference: POST /preapproval](https://www.mercadopago.com/developers/es/reference/subscriptions/_preapproval/post)
- [Webhooks de Suscripciones](https://www.mercadopago.com/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan/authorized-payments)

