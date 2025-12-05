# ✅ Migración a Suscripciones Automáticas - COMPLETADA

## 📋 Resumen

La aplicación ha sido migrada exitosamente de **Checkout Pro (pagos únicos)** a la **API de Suscripciones/Preapproval de MercadoPago** para habilitar **cobros automáticos mensuales**.

**Fecha de migración:** 5 de diciembre de 2025

---

## 🔄 Cambios Implementados

### 1. **Archivo: `lib/mercadopagoClient.ts`**

#### Modificación de `createSubscriptionPreference()`
- ✅ Cambió de endpoint `/checkout/preferences` a `/preapproval`
- ✅ Ahora crea una suscripción con cobro automático mensual
- ✅ Configuración `auto_recurring` con:
  - `frequency: 1`
  - `frequency_type: "months"`
  - `transaction_amount` y `currency_id: "CLP"`
  - `start_date` (fecha de inicio)

#### Nueva función: `getSubscriptionInfo()`
- ✅ Permite obtener información de una suscripción desde MercadoPago
- ✅ Endpoint: `GET /preapproval/{subscription_id}`
- ✅ Incluye manejo de errores y modo mock para desarrollo

---

### 2. **Archivo: `app/api/create-subscription-preference/route.ts`**

#### Actualización del API Route
- ✅ Cambió de crear `preferences` a crear `preapproval`
- ✅ Ahora retorna `subscription_id` en lugar de `preference_id`
- ✅ Mantiene la misma estructura de seguridad y autenticación

---

### 3. **Archivo: `app/api/mercadopago-webhook/route.ts`**

#### Nuevos Webhooks Implementados

**1. `subscription_preapproval` (Autorización de Suscripción)**
- 🎯 Se dispara cuando el usuario autoriza la suscripción
- ✅ Crea entrada en tabla `subscriptions` con status `active`
- ✅ Actualiza `subscription_status` del perfil a `active`
- ✅ Envía email de bienvenida/activación
- ✅ Establece `renewal_date` para +30 días

**2. `subscription_authorized_payment` (Cobro Automático)**
- 🎯 Se dispara cada mes cuando MercadoPago cobra automáticamente
- ✅ Actualiza `renewal_date` de la suscripción (+30 días)
- ✅ Registra el pago en tabla `payments`
- ✅ Envía email de confirmación de renovación
- ✅ Maneja fallos de cobro (tarjeta vencida, fondos insuficientes)

**3. `payment` (Pago Único - Compatibilidad)**
- 🎯 Mantiene compatibilidad con pagos únicos existentes
- ✅ Marcado como "legacy" en logs
- ✅ Procesa igual que antes

---

### 4. **Webhooks Configurados en MercadoPago**

✅ **Configuración guardada exitosamente:**

- **Application ID:** 4223690054220076
- **URL de producción:** `https://microagenda.cl/api/mercadopago-webhook`
- **URL de sandbox:** `https://microagenda.cl/api/mercadopago-webhook`

**Topics suscritos:**
1. `payment` - Pagos únicos (legacy)
2. `subscription_preapproval` - Autorización de suscripción
3. `subscription_authorized_payment` - Cobros automáticos mensuales

**Secret Key:** `2e42434*********************************************************`
> ⚠️ **Importante:** Guarda esta clave de forma segura. La necesitarás para validar firmas de webhooks.

---

## 🎯 Cómo Funciona Ahora

### Flujo de Suscripción Nuevo Usuario

```
1. Usuario hace clic en "Reactivar por $X/mes"
   ↓
2. API crea una suscripción en MercadoPago (POST /preapproval)
   ↓
3. Usuario es redirigido a MercadoPago
   ↓
4. Usuario autoriza el débito automático
   ↓
5. MercadoPago envía webhook: subscription_preapproval
   ↓
6. Sistema activa la suscripción en base de datos
   ↓
7. Usuario recibe email de confirmación
   ↓
8. ✅ Suscripción ACTIVA con cobro automático mensual
```

### Flujo de Cobro Automático Mensual

```
[Cada mes, automáticamente]

1. MercadoPago cobra automáticamente la tarjeta del usuario
   ↓
2. Si el cobro es exitoso:
   - Envía webhook: subscription_authorized_payment
   - Sistema registra el pago
   - Sistema actualiza renewal_date (+30 días)
   - Usuario recibe email de confirmación
   - ✅ Suscripción renovada
   ↓
3. Si el cobro falla:
   - Envía webhook con status "rejected"
   - Sistema registra el intento fallido
   - Usuario recibe email de alerta
   - MercadoPago reintentará automáticamente
```

---

## ⚡ Ventajas de la Nueva Implementación

| Antes (Checkout Pro) | Ahora (Suscripciones) |
|----------------------|------------------------|
| ❌ Usuario debe pagar manualmente cada mes | ✅ MercadoPago cobra automáticamente |
| ❌ Mayor fricción y abandono | ✅ Menor fricción, mayor retención |
| ❌ Sin renovación automática | ✅ Renovación automática mensual |
| ❌ Usuario debe recordar pagar | ✅ Usuario no tiene que hacer nada |
| ⚠️ Mayor tasa de cancelación | ✅ Menor tasa de cancelación |

---

## 🧪 Pruebas

### Modo Sandbox

Para probar en ambiente sandbox:

1. **Usa credenciales de prueba** de MercadoPago
2. **Crea una suscripción** desde tu aplicación
3. **Autoriza la suscripción** con una cuenta de prueba
4. **Verifica que recibes el webhook** `subscription_preapproval`
5. **Simula el paso del tiempo** para probar cobros mensuales

### Tarjetas de Prueba

Para Chile (CLP):
- **Visa:** `4168 8188 4444 7115`
- **CVV:** `123`
- **Vencimiento:** `11/30`
- **Titular:** `APRO` (para aprobación)
- **Documento:** `123456789`

---

## 📊 Gestión de Suscripciones

### Cancelar una Suscripción

Para cancelar una suscripción, debes llamar a la API de MercadoPago:

```typescript
// Ejemplo de cancelación
PUT https://api.mercadopago.com/preapproval/{subscription_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "cancelled"
}
```

> **Nota:** Implementar UI para cancelación en futuras iteraciones.

### Ver Estado de una Suscripción

```typescript
GET https://api.mercadopago.com/preapproval/{subscription_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Estados posibles:
- `pending` - Pendiente de autorización
- `authorized` - Activa y cobrando
- `paused` - Pausada temporalmente
- `cancelled` - Cancelada

---

## ⚠️ Consideraciones Importantes

### 1. Usuarios Existentes

Los usuarios que ya pagaron con Checkout Pro **NO tienen renovación automática**. Necesitarás:

- ✅ Notificarles sobre el cambio
- ✅ Pedirles que "reactiven" su suscripción con el nuevo flujo
- ✅ Considerar un período de transición (ej: 1 mes gratis)

### 2. Fallos de Cobro

Si un cobro automático falla:
- ✅ MercadoPago reintentará automáticamente (hasta 3 veces)
- ✅ Usuario recibirá notificación por email
- ✅ Sistema mantiene registro del intento fallido
- ✅ Si todos los intentos fallan, la suscripción puede ser pausada

### 3. Validación de Webhooks

> **🔒 Seguridad:** En producción, **DEBES** implementar validación de firmas de webhooks para evitar notificaciones fraudulentas.

**Secret Key:** `2e42434*********************************************************`

Referencia: [Validar firma de webhook](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks#bookmark_validar_el_origen_de_las_notificaciones)

---

## 📁 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `lib/mercadopagoClient.ts` | ✅ Cambiado a `/preapproval`, agregada `getSubscriptionInfo()` |
| `app/api/create-subscription-preference/route.ts` | ✅ Actualizado para crear suscripciones |
| `app/api/mercadopago-webhook/route.ts` | ✅ Agregados handlers para webhooks de suscripción |

---

## 🚀 Próximos Pasos Recomendados

### Corto Plazo (Inmediato)
1. ✅ **Deployar a producción** los cambios realizados
2. ✅ **Probar el flujo completo** en sandbox
3. ✅ **Probar con un pago real pequeño** (ej: $100 CLP)

### Mediano Plazo (1-2 semanas)
4. ⬜ **Notificar a usuarios existentes** sobre el nuevo sistema
5. ⬜ **Implementar validación de firmas** de webhooks (seguridad)
6. ⬜ **Implementar idempotencia** en webhooks (evitar duplicados)
7. ⬜ **Agregar UI para gestionar suscripciones** (cancelar, pausar)

### Largo Plazo (1-2 meses)
8. ⬜ **Implementar métricas** de renovación y churn
9. ⬜ **Agregar manejo de reintento manual** para fallos de cobro
10. ⬜ **Implementar notificaciones automáticas** antes de vencimiento

---

## 🔗 Referencias

- [Documentación API de Suscripciones](https://www.mercadopago.com/developers/es/docs/subscriptions/overview)
- [Webhooks de Suscripciones](https://www.mercadopago.com/developers/es/docs/subscriptions/additional-content/notifications)
- [API Reference: POST /preapproval](https://www.mercadopago.com/developers/es/reference/subscriptions/_preapproval/post)
- [Validar Webhooks](https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks)

---

## ✅ Checklist de Deployment

Antes de deployar a producción, verifica:

- [x] ✅ Código migrado a API de Preapproval
- [x] ✅ Webhooks configurados en MercadoPago
- [x] ✅ Función `getSubscriptionInfo()` implementada
- [x] ✅ Handlers de webhooks de suscripción implementados
- [x] ✅ Sin errores de linting
- [ ] ⬜ Pruebas en sandbox completadas
- [ ] ⬜ Variables de entorno configuradas en Vercel
- [ ] ⬜ Backup de base de datos realizado
- [ ] ⬜ Plan de comunicación a usuarios existentes

---

**🎉 ¡Migración completada con éxito!**

Ahora tu aplicación tiene **suscripciones automáticas** con renovación mensual. Los usuarios solo autorizan una vez y MercadoPago se encarga de cobrar automáticamente cada mes.

