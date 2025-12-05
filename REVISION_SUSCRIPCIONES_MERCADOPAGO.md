# Revisión: Implementación de Suscripciones MercadoPago

## ⚠️ Situación Actual

**Tu implementación actual usa:**
- ✅ **Checkout Pro** con `preferences` (pagos únicos)
- ❌ **NO** usa la API de **Suscripciones/Preapproval** de MercadoPago

**Diferencia clave:**
- **Checkout Pro**: El usuario debe pagar manualmente cada mes
- **Suscripciones/Preapproval**: MercadoPago cobra automáticamente cada mes (débito automático)

---

## 🔍 Análisis de tu Implementación Actual

### Lo que tienes ahora (Checkout Pro):

```typescript
// Creas una "preference" (pago único)
POST https://api.mercadopago.com/checkout/preferences
```

**Características:**
- ✅ Usuario paga una vez
- ✅ Recibes webhook cuando se aprueba el pago
- ❌ **NO** se renueva automáticamente
- ❌ Usuario debe volver a pagar manualmente cada mes

### Lo que deberías tener (Suscripciones):

```typescript
// Creas un "preapproval" (suscripción recurrente)
POST https://api.mercadopago.com/preapproval
```

**Características:**
- ✅ Usuario autoriza débito automático
- ✅ MercadoPago cobra automáticamente cada mes
- ✅ Recibes webhooks cuando se procesa cada cobro
- ✅ No requiere intervención del usuario cada mes

---

## 📊 Comparación: Checkout Pro vs Suscripciones

| Aspecto | Checkout Pro (Actual) | Suscripciones/Preapproval |
|---------|----------------------|---------------------------|
| **Renovación automática** | ❌ No | ✅ Sí |
| **Intervención del usuario** | Requerida cada mes | Solo la primera vez |
| **Webhooks** | `payment` | `payment`, `preapproval`, `subscription_preapproval` |
| **Endpoint** | `/checkout/preferences` | `/preapproval` |
| **Complejidad** | Baja | Media |
| **Mejor para** | Pagos únicos o manuales | Pagos recurrentes automáticos |

---

## ✅ Recomendación: Migrar a Suscripciones

**Para un servicio de suscripción mensual, deberías usar la API de Suscripciones de MercadoPago** porque:

1. **Experiencia del usuario mejor**: No necesita recordar pagar cada mes
2. **Menos fricción**: Mayor tasa de retención
3. **Automatización**: MercadoPago maneja los cobros recurrentes
4. **Webhooks automáticos**: Recibes notificaciones de cada cobro mensual

---

## 🔧 Cómo Implementar Suscripciones

### 1. Crear Preapproval (en lugar de Preference)

```typescript
// app/api/create-subscription-preference/route.ts
export async function POST(request: NextRequest) {
  // ... validación de auth ...

  // En lugar de crear una preference, crear un preapproval
  const response = await fetch(
    "https://api.mercadopago.com/preapproval",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: `MicroAgenda - Plan ${planName} (Mensual)`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: planPrice,
          currency_id: "CLP",
          start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
          end_date: null, // Sin fecha de fin
        },
        payer_email: userEmail,
        external_reference: userId,
        notification_url: `${APP_URL}/api/mercadopago-webhook`,
        back_url: `${APP_URL}/dashboard?subscription=success`,
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("MercadoPago API error:", data);
    return NextResponse.json(
      { success: false, error: data },
      { status: 500 }
    );
  }

  // El init_point ahora es para autorizar la suscripción
  return NextResponse.json({
    success: true,
    init_point: data.init_point,
    preapproval_id: data.id,
  });
}
```

### 2. Actualizar Webhook Handler

```typescript
// app/api/mercadopago-webhook/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("MercadoPago Webhook received:", body);

    // Manejar diferentes tipos de notificaciones
    if (body.type === "payment") {
      // Pago individual de una suscripción
      await handlePaymentNotification(body);
    } else if (body.type === "preapproval") {
      // Creación/actualización de suscripción
      await handlePreapprovalNotification(body);
    } else if (body.type === "subscription_preapproval") {
      // Eventos específicos de suscripción
      await handleSubscriptionPreapprovalNotification(body);
    } else {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    return NextResponse.json({ status: "processed" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handlePreapprovalNotification(body: any) {
  const preapprovalId = body.data?.id;
  
  // Obtener información del preapproval
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );
  
  const preapproval = await response.json();
  const userId = preapproval.external_reference || preapproval.metadata?.user_id;
  
  if (preapproval.status === "authorized") {
    // Suscripción autorizada, activar en BD
    await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan_id: preapproval.metadata?.plan_id,
        mercadopago_id: preapprovalId.toString(),
        mercadopago_type: "preapproval", // Nuevo campo
        status: "active",
        start_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial: false,
      });
    
    await supabase
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("id", userId);
  }
}

async function handlePaymentNotification(body: any) {
  // Similar al código actual, pero ahora es un pago de suscripción recurrente
  const paymentId = body.data?.id;
  const paymentResult = await getPaymentInfo(paymentId);
  const payment = paymentResult.payment;
  
  // Verificar si es un pago de suscripción
  if (payment.subscription_id || payment.preapproval_id) {
    // Es un pago recurrente automático
    // Actualizar renewal_date en la suscripción
    // Registrar el pago
  }
}
```

### 3. Actualizar Schema de Base de Datos

```sql
-- Agregar campo para identificar tipo de suscripción
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS mercadopago_type TEXT DEFAULT 'payment'; 
-- 'payment' = Checkout Pro, 'preapproval' = Suscripciones

-- Agregar campo para ID del preapproval
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS mercadopago_preapproval_id TEXT;
```

---

## 📋 Checklist de Migración

### Paso 1: Preparación
- [ ] Revisar documentación de Suscripciones MercadoPago
- [ ] Actualizar schema de BD
- [ ] Crear funciones helper para preapproval

### Paso 2: Implementación
- [ ] Modificar `create-subscription-preference` para usar `/preapproval`
- [ ] Actualizar webhook handler para manejar `preapproval` y `subscription_preapproval`
- [ ] Agregar manejo de estados de preapproval (authorized, paused, cancelled)

### Paso 3: Testing
- [ ] Probar creación de preapproval en sandbox
- [ ] Verificar webhooks de preapproval
- [ ] Simular cobros recurrentes mensuales
- [ ] Probar pausa/cancelación de suscripción

### Paso 4: Producción
- [ ] Actualizar webhook URL en MercadoPago
- [ ] Configurar eventos: `payment`, `preapproval`, `subscription_preapproval`
- [ ] Migrar usuarios existentes (opcional)

---

## 🔗 Referencias

- [Documentación Suscripciones MercadoPago](https://www.mercadopago.cl/developers/es/docs/subscriptions/landing)
- [API Preapproval](https://www.mercadopago.cl/developers/es/reference/subscriptions/_preapproval/post)
- [Webhooks de Suscripciones](https://www.mercadopago.cl/developers/es/docs/subscriptions/additional-content/webhooks)
- [Gestión de Suscripciones](https://www.mercadopago.cl/developers/es/docs/subscriptions/subscription-management)

---

## 💡 Resumen

**Estado Actual**: ✅ Funcional pero **NO es una suscripción real**
- Usas Checkout Pro (pagos únicos)
- Usuario debe pagar manualmente cada mes

**Recomendación**: 🔄 **Migrar a API de Suscripciones**
- Implementa débito automático
- Mejor experiencia de usuario
- Menos fricción y mayor retención

¿Quieres que implemente la migración a Suscripciones ahora?

