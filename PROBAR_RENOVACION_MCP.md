# Guía: Probar Renovación con MCP de MercadoPago

## ✅ Estado Actual

- ✅ Webhook configurado: `https://microagenda.cl/api/mercadopago-webhook`
- ✅ Cuenta en estado `expired` (listo para probar renovación)
- ⏳ Necesitamos un `payment_id` real para simular

## 🚀 Pasos para Probar

### Paso 1: Crear un Pago de Prueba

Tienes dos opciones:

#### Opción A: Desde la UI de tu App (Más Realista)

1. **Inicia sesión** en https://microagenda.cl
   - Email: `marcelo.coliqueo@gmail.com`
   - Tu cuenta está en estado `expired`

2. **Click en "Reactivar Suscripción"**
   - Deberías ver la pantalla de bloqueo
   - Click en el botón de reactivación

3. **Completa el pago con tarjeta de prueba**:
   - **Número**: `4509 9535 6623 3704`
   - **CVV**: `123`
   - **Fecha**: Cualquier fecha futura (ej: 12/25)
   - **Titular**: Cualquier nombre
   - **Email**: `marcelo.coliqueo@gmail.com`

4. **Anota el Payment ID**:
   - Aparece en la URL de retorno
   - O en MercadoPago Developer → Actividad

#### Opción B: Desde MercadoPago Developer

1. Ve a [MercadoPago Developer](https://www.mercadopago.cl/developers)
2. Tu Aplicación → **Actividad**
3. Crea un pago de prueba manualmente
4. Copia el **Payment ID**

---

### Paso 2: Simular Webhook con MCP

Una vez que tengas el `payment_id`, ejecuta:

```typescript
mcp_mercadopago-mcp-server_simulate_webhook({
  resource_id: "TU_PAYMENT_ID_AQUI",
  topic: "payment",
  callback_env_production: false  // false para sandbox, true para producción
})
```

**Ejemplo**:
```typescript
mcp_mercadopago-mcp-server_simulate_webhook({
  resource_id: "1234567890",
  topic: "payment",
  callback_env_production: false
})
```

---

### Paso 3: Verificar Resultado

Después de simular el webhook:

1. **Verifica en la BD**:
```sql
SELECT 
  email,
  subscription_status,
  s.status,
  s.renewal_date
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'marcelo.coliqueo@gmail.com';
```

2. **Verifica logs en Vercel**:
   - Ve a Vercel Dashboard → Tu proyecto → Logs
   - Busca: `"MercadoPago Webhook received"`

3. **Verifica en la UI**:
   - Recarga el dashboard
   - Deberías poder acceder a todas las páginas

---

## 🔍 Verificar Webhook Configurado

El webhook ya está configurado con:
- **URL Producción**: `https://microagenda.cl/api/mercadopago-webhook`
- **URL Sandbox**: `https://microagenda.cl/api/mercadopago-webhook`
- **Topics**: `payment`

---

## 📋 Checklist

- [ ] Cuenta en estado `expired` ✅
- [ ] Webhook configurado ✅
- [ ] Crear pago de prueba (pendiente)
- [ ] Obtener `payment_id` (pendiente)
- [ ] Simular webhook con MCP (pendiente)
- [ ] Verificar que estado cambia a `active` (pendiente)
- [ ] Verificar que suscripción se crea (pendiente)
- [ ] Verificar acceso al dashboard (pendiente)

---

## 💡 Alternativa Rápida

Si quieres probar sin crear un pago real, puedes:

1. **Simular directamente en BD** (ya lo hicimos antes):
```sql
UPDATE profiles SET subscription_status = 'active' WHERE email = 'marcelo.coliqueo@gmail.com';
```

2. **O usar el script test-renewal.ts** que simula todo el proceso

Pero para probar el **flujo completo del webhook**, necesitas un `payment_id` real.

---

## 🆘 Si el MCP no funciona

Si `simulate_webhook` falla (por ejemplo, URL no accesible), puedes:

1. **Probar desde la UI directamente** (el webhook se procesará automáticamente)
2. **Usar el script test-webhook.ts** con datos mock
3. **Verificar logs** en Vercel para ver si el webhook se procesa

---

¿Tienes un `payment_id` de prueba que quieras usar? Si no, te recomiendo crear uno desde la UI primero.

