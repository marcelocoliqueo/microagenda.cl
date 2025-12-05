# Revisión de Implementación MercadoPago

## ✅ Aspectos Correctos

### 1. **Checkout Preferences (Creación de Preferencias)**

✅ **Correcto**: Uso de `external_reference` para identificar al usuario
```typescript
external_reference: userId,
```

✅ **Correcto**: Uso de `metadata` para almacenar información adicional
```typescript
metadata: {
  user_id: userId,
  plan_id: planId,
},
```

✅ **Correcto**: Configuración de `back_urls` para redirección después del pago
```typescript
back_urls: {
  success: `${APP_URL}/dashboard?payment=success`,
  failure: `${APP_URL}/dashboard?payment=failure`,
  pending: `${APP_URL}/dashboard?payment=pending`,
},
```

✅ **Correcto**: Configuración de `notification_url` para recibir webhooks
```typescript
notification_url: `${APP_URL}/api/mercadopago-webhook`,
```

✅ **Correcto**: Uso de `statement_descriptor` para identificar el cargo en el estado de cuenta
```typescript
statement_descriptor: "MicroAgenda",
```

✅ **Correcto**: Título descriptivo del item
```typescript
title: `MicroAgenda - Plan ${planName} (Mensual)`,
```

### 2. **Webhook Handler**

✅ **Correcto**: Verificación del tipo de notificación
```typescript
if (body.type !== "payment") {
  return NextResponse.json({ status: "ignored" }, { status: 200 });
}
```

✅ **Correcto**: Extracción de `user_id` desde `external_reference` y `metadata`
```typescript
const userId = payment.external_reference || payment.metadata?.user_id;
```

✅ **Correcto**: Manejo de diferentes estados de pago
```typescript
if (payment.status === "approved") {
  // Activar suscripción
} else if (["rejected", "cancelled", "refunded", "charged_back"].includes(payment.status)) {
  // Manejar pagos fallidos
}
```

✅ **Correcto**: Respuesta HTTP 200 para notificaciones procesadas
```typescript
return NextResponse.json({ status: "processed" }, { status: 200 });
```

✅ **Correcto**: Endpoint GET para verificación de MercadoPago
```typescript
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
```

### 3. **Seguridad**

✅ **Correcto**: Uso de API route server-side para crear preferencias (no expone `MERCADOPAGO_ACCESS_TOKEN` al cliente)

✅ **Correcto**: Verificación de autenticación antes de crear preferencias
```typescript
const token = authHeader.replace("Bearer ", "");
const { data: { user }, error: authError } = await supabase.auth.getUser(token);
```

---

## ⚠️ Mejoras Recomendadas

### 1. **Validación de Firma de Webhook** (CRÍTICO para Producción)

**Problema**: Actualmente no se valida la firma del webhook, lo que puede permitir que terceros envíen notificaciones falsas.

**Solución**: Implementar validación de firma usando `x-signature` y `x-request-id`:

```typescript
import crypto from 'crypto';

function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  action: string,
  data: any
): boolean {
  if (!xSignature || !xRequestId) {
    return false;
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET; // Configurar en Vercel
  if (!secret) {
    console.warn("MERCADOPAGO_WEBHOOK_SECRET not configured");
    return false; // En producción, esto debería fallar
  }

  // Construir el string a verificar
  const manifest = `${dataId};${action};${JSON.stringify(data)}`;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return hash === xSignature;
}

// En el webhook handler:
export async function POST(request: NextRequest) {
  try {
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    const body = await request.json();

    // Validar firma (solo en producción o si está configurado)
    if (process.env.NODE_ENV === 'production' && process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const isValid = validateWebhookSignature(
        xSignature,
        xRequestId,
        body.data?.id,
        body.action,
        body.data
      );

      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // ... resto del código
  }
}
```

**Nota**: Para obtener el `MERCADOPAGO_WEBHOOK_SECRET`, ve a:
- MercadoPago Developer → Tu aplicación → Webhooks → Configuración avanzada

### 2. **Idempotencia** (IMPORTANTE)

**Problema**: Si MercadoPago envía la misma notificación múltiples veces, se pueden crear suscripciones duplicadas.

**Solución**: Verificar si el pago ya fue procesado antes de crear/actualizar la suscripción:

```typescript
// Antes de crear la suscripción
const { data: existingSubscription } = await supabase
  .from("subscriptions")
  .select("id, status")
  .eq("mercadopago_id", paymentId.toString())
  .single();

if (existingSubscription) {
  console.log(`Payment ${paymentId} already processed`);
  return NextResponse.json({ status: "already_processed" }, { status: 200 });
}
```

### 3. **Manejo de Errores Mejorado**

**Mejora**: Agregar más logging y manejo de errores específicos:

```typescript
try {
  // ... código existente
} catch (error: any) {
  console.error("Webhook error:", {
    error: error.message,
    stack: error.stack,
    body: JSON.stringify(body),
    paymentId,
  });
  
  // En producción, podrías enviar esto a un servicio de monitoreo (Sentry, etc.)
  
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

### 4. **Validación de Datos del Pago**

**Mejora**: Validar que el pago corresponde al plan esperado:

```typescript
// Verificar que el monto del pago coincide con el plan
const { data: plan } = await supabase
  .from("plans")
  .select("price")
  .eq("id", planId)
  .single();

if (plan && payment.transaction_amount !== plan.price) {
  console.error(`Payment amount mismatch: expected ${plan.price}, got ${payment.transaction_amount}`);
  // Decidir si rechazar o aceptar (depende de tu lógica de negocio)
}
```

### 5. **Timeout y Reintentos**

**Mejora**: MercadoPago espera una respuesta en menos de 5 segundos. Si tu procesamiento tarda más, deberías:

1. Responder inmediatamente con HTTP 200
2. Procesar el pago de forma asíncrona (usando una cola o función en background)

```typescript
// Responder inmediatamente
return NextResponse.json({ status: "received" }, { status: 200 });

// Procesar de forma asíncrona (ejemplo con una función en background)
// await processPaymentAsync(paymentId);
```

---

## 📋 Checklist de Implementación

### Para Desarrollo (Sandbox)
- [x] ✅ Crear preferencias con `external_reference`
- [x] ✅ Configurar `notification_url`
- [x] ✅ Manejar diferentes estados de pago
- [x] ✅ Responder con HTTP 200
- [ ] ⚠️ Validar firma de webhook (opcional en sandbox)
- [ ] ⚠️ Implementar idempotencia

### Para Producción (CRÍTICO)
- [ ] 🔴 **Validar firma de webhook** (OBLIGATORIO)
- [ ] 🔴 **Implementar idempotencia** (OBLIGATORIO)
- [ ] 🟡 Mejorar logging y monitoreo
- [ ] 🟡 Validar monto del pago
- [ ] 🟡 Manejar timeouts y procesamiento asíncrono

---

## 🔍 Verificación con MCP

El MCP de MercadoPago no pudo validar la calidad automáticamente porque:
- El producto "Checkout Pro" no es homologable automáticamente
- Requiere revisión manual de la implementación

Sin embargo, la implementación actual sigue las mejores prácticas básicas de MercadoPago.

---

## 📚 Referencias

- [Documentación Webhooks MercadoPago](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/your-integrations/notifications/webhooks)
- [Validación de Firma de Webhooks](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/your-integrations/notifications/webhooks#bookmark_validación_de_firma)
- [Mejores Prácticas Checkout Pro](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/best-practices)

---

## 🎯 Resumen

**Estado Actual**: ✅ **Implementación básica correcta**

**Para Producción**: ⚠️ **Requiere mejoras de seguridad** (validación de firma e idempotencia)

La implementación actual es funcional para desarrollo y pruebas, pero antes de ir a producción, es **crítico** implementar:
1. Validación de firma de webhook
2. Idempotencia en el procesamiento de pagos

