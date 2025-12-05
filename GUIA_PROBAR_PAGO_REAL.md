# Guía: Probar Renovación con MercadoPago Real (Sandbox)

## ✅ Requisitos Previos

1. **MERCADOPAGO_ACCESS_TOKEN configurado en Vercel**
   - Ve a Vercel → Tu proyecto → Settings → Environment Variables
   - Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté configurado
   - Debe empezar con `TEST-` para sandbox o `APP-` para producción
   - Si no está configurado, sigue los pasos en `MERCADOPAGO_SETUP.md`

2. **Webhook configurado en MercadoPago**
   - Ya está configurado: `https://microagenda.cl/api/mercadopago-webhook`
   - Verificado con el MCP ✅

3. **Cuenta en estado `expired`**
   - Tu cuenta `marcelo.coliqueo@gmail.com` ya está en estado `expired` ✅

---

## 🚀 Pasos para Probar

### Paso 1: Verificar que NO esté en Modo Mock

El código usa modo mock **solo si** `MERCADOPAGO_ACCESS_TOKEN` no está configurado.

Para verificar:
1. Ve a Vercel → Tu proyecto → Settings → Environment Variables
2. Busca `MERCADOPAGO_ACCESS_TOKEN`
3. Si existe y empieza con `TEST-` o `APP-`, **NO usará modo mock** ✅

---

### Paso 2: Iniciar el Flujo de Pago

1. **Inicia sesión** en https://microagenda.cl
   - Email: `marcelo.coliqueo@gmail.com`
   - Tu cuenta está en estado `expired`

2. **Deberías ver la pantalla de bloqueo** con el botón "Reactivar por $8.500/mes"

3. **Click en "Reactivar por $8.500/mes"**
   - Deberías ser redirigido a MercadoPago Checkout
   - Si ves un error o no pasa nada, revisa la consola del navegador (F12)

---

### Paso 3: Completar el Pago con Tarjeta de Prueba

Usa una de estas tarjetas de prueba para **Chile**:

#### ✅ Tarjeta Visa (Pago Aprobado)

- **Número**: `4168 8188 4444 7115`
- **CVV**: `123`
- **Fecha de vencimiento**: `11/30` (o cualquier fecha futura)
- **Titular**: `APRO` (importante: este nombre hace que el pago se apruebe)
- **Documento**: `123456789` (tipo: "otro")
- **Email**: `marcelo.coliqueo@gmail.com`

#### ✅ Tarjeta Mastercard (Pago Aprobado)

- **Número**: `5416 7526 0258 2580`
- **CVV**: `123`
- **Fecha de vencimiento**: `11/30`
- **Titular**: `APRO`
- **Documento**: `123456789`
- **Email**: `marcelo.coliqueo@gmail.com`

---

### Paso 4: Verificar el Resultado

Después de completar el pago:

1. **MercadoPago te redirigirá** a `/dashboard?payment=success`

2. **El webhook se procesará automáticamente**:
   - MercadoPago enviará una notificación a `https://microagenda.cl/api/mercadopago-webhook`
   - El webhook actualizará el estado de suscripción a `active`
   - Se creará/actualizará la entrada en la tabla `subscriptions`

3. **Verifica en el dashboard**:
   - Recarga la página
   - Deberías poder acceder a todas las páginas del dashboard
   - El `SubscriptionGuard` ya no debería bloquear el acceso

---

### Paso 5: Verificar en la Base de Datos

Puedes verificar que todo funcionó correctamente:

```sql
-- Ver estado de suscripción
SELECT 
  email,
  subscription_status,
  s.status as subscription_table_status,
  s.renewal_date,
  s.mercadopago_id
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'marcelo.coliqueo@gmail.com';
```

Deberías ver:
- `subscription_status`: `active`
- `subscription_table_status`: `active`
- `renewal_date`: Fecha 30 días en el futuro
- `mercadopago_id`: ID del pago de MercadoPago

---

## 🔍 Depuración

### Si el botón no hace nada:

1. **Abre la consola del navegador** (F12 → Console)
2. **Haz click en "Reactivar"**
3. **Busca estos mensajes**:
   - `🔄 Iniciando proceso de suscripción...`
   - `✅ Plan encontrado:`
   - `📦 Resultado de createSubscriptionPreference:`
   - Si hay errores, aparecerán en rojo

### Si no redirige a MercadoPago:

1. **Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté configurado** en Vercel
2. **Verifica que el token sea válido**:
   - Debe empezar con `TEST-` (sandbox) o `APP-` (producción)
   - No debe tener espacios ni saltos de línea
3. **Revisa los logs de Vercel**:
   - Vercel → Tu proyecto → Logs
   - Busca errores relacionados con MercadoPago

### Si el pago se completa pero no se actualiza:

1. **Verifica que el webhook esté configurado**:
   - Ve a MercadoPago Developer → Tu aplicación → Webhooks
   - Debe estar: `https://microagenda.cl/api/mercadopago-webhook`

2. **Revisa los logs del webhook**:
   - Vercel → Tu proyecto → Logs
   - Busca: `"MercadoPago Webhook received"`

3. **Verifica en MercadoPago**:
   - Ve a MercadoPago Developer → Actividad
   - Busca el pago reciente
   - Verifica que el webhook se haya enviado

---

## 📋 Checklist de Prueba

- [ ] `MERCADOPAGO_ACCESS_TOKEN` configurado en Vercel
- [ ] Webhook configurado en MercadoPago
- [ ] Cuenta en estado `expired`
- [ ] Click en "Reactivar" redirige a MercadoPago
- [ ] Pago completado con tarjeta de prueba
- [ ] Redirección a `/dashboard?payment=success`
- [ ] Estado de suscripción actualizado a `active` en BD
- [ ] Acceso al dashboard desbloqueado
- [ ] Webhook procesado correctamente (ver logs)

---

## 🎯 Tarjetas de Prueba Adicionales (Chile)

### Para probar diferentes escenarios:

| Escenario | Tarjeta | Titular | Documento |
|-----------|---------|---------|------------|
| ✅ Pago Aprobado | `4168 8188 4444 7115` (Visa) | `APRO` | `123456789` |
| ✅ Pago Aprobado | `5416 7526 0258 2580` (Mastercard) | `APRO` | `123456789` |
| ❌ Rechazado (Error general) | `4168 8188 4444 7115` | `OTHE` | `123456789` |
| ⏳ Pendiente | `4168 8188 4444 7115` | `CONT` | - |
| ❌ Fondos insuficientes | `4168 8188 4444 7115` | `FUND` | `123456789` |

**Nota**: El número de tarjeta puede ser el mismo, lo que cambia el resultado es el **nombre del titular**.

---

## 💡 Notas Importantes

1. **Modo Sandbox**: Todas estas pruebas son en modo sandbox (pruebas). No se cobra dinero real.

2. **Webhook puede tardar**: El webhook puede tardar unos segundos en procesarse. Si no se actualiza inmediatamente, espera 10-15 segundos y recarga.

3. **Logs en Vercel**: Si algo no funciona, revisa siempre los logs de Vercel primero.

4. **Token de Prueba vs Producción**:
   - `TEST-xxxxx`: Para pruebas (sandbox)
   - `APP-xxxxx`: Para producción (dinero real)

---

¿Listo para probar? 🚀

Si encuentras algún problema, comparte:
1. Los mensajes de la consola del navegador
2. Los logs de Vercel
3. El estado actual de la suscripción en la BD

