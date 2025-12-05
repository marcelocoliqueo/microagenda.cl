# Guía para Probar Renovación de Suscripción

## ✅ Estado Actual

Tu cuenta `marcelo.coliqueo@gmail.com` ha sido renovada exitosamente:
- **Estado**: `active` ✅
- **Fecha de inicio**: 4 de diciembre de 2025
- **Próxima renovación**: 3 de enero de 2026

## 🔄 Métodos para Probar Renovación

### Método 1: Simulación Directa en BD (Ya ejecutado) ✅

Usando el MCP de Supabase, actualizamos directamente:
- Estado del perfil: `expired` → `active`
- Creación de suscripción activa
- Fecha de renovación: +30 días

**Ventaja**: Rápido, no requiere pago real
**Desventaja**: No prueba el flujo completo de webhook

---

### Método 2: Probar desde la UI (Recomendado para flujo completo)

1. **Inicia sesión** con tu cuenta
2. **Ve al dashboard** - deberías ver que ya está activa
3. **O simula que está expirada**:
   ```sql
   -- En Supabase SQL Editor
   UPDATE profiles 
   SET subscription_status = 'expired' 
   WHERE email = 'marcelo.coliqueo@gmail.com';
   ```
4. **Click en "Reactivar Suscripción"**
5. **Usa tarjeta de prueba de MercadoPago**:
   - Visa: `4509 9535 6623 3704`
   - CVV: `123`
   - Fecha: Cualquier fecha futura
6. **Completa el pago** en MercadoPago Checkout
7. **Verifica** que el webhook actualiza tu estado

---

### Método 3: Usar MCP de MercadoPago

El MCP de MercadoPago tiene estas herramientas:

#### 3.1 Simular Webhook
```typescript
mcp_mercadopago-mcp-server_simulate_webhook({
  resource_id: "PAYMENT_ID_REAL",
  topic: "payment",
  callback_env_production: false  // true para producción
})
```

**Requisitos**:
- Necesitas un `payment_id` real de MercadoPago
- El webhook debe estar configurado y accesible
- La URL debe ser pública (no localhost)

**Cómo obtener un payment_id**:
1. Crea un pago de prueba desde la UI
2. O usa el dashboard de MercadoPago → Actividad
3. Copia el ID del pago

#### 3.2 Verificar Calidad de Integración
```typescript
mcp_mercadopago-mcp-server_quality_evaluation({
  payment_id: 1234567890
})
```

Esto evalúa la calidad de tu integración según estándares de MercadoPago.

#### 3.3 Ver Historial de Notificaciones
```typescript
mcp_mercadopago-mcp-server_notifications_history()
```

Muestra el historial de webhooks enviados y recibidos.

---

### Método 4: Script de Prueba Local

Usa el script `test-webhook.ts` modificado:

```typescript
// Modifica test-webhook.ts con datos reales:
const mockPaymentData = {
  type: 'payment',
  data: {
    id: 'TU_PAYMENT_ID_REAL',  // Obtener de MercadoPago
  },
  // ... resto del payload
};
```

**Ejecutar**:
```bash
npm run dev  # En una terminal
npx tsx scripts/test-webhook.ts  # En otra terminal
```

---

### Método 5: Usar MercadoPago Sandbox

1. **Ve a MercadoPago Developer** → Tu aplicación
2. **Activa modo Sandbox** (Pruebas)
3. **Crea un pago de prueba**:
   - Usa el Checkout Pro
   - Tarjeta de prueba: `4509 9535 6623 3704`
4. **MercadoPago enviará el webhook automáticamente**
5. **Verifica logs** en Vercel o localhost

---

## 📋 Checklist de Prueba

Para probar completamente la renovación:

- [ ] Estado cambia de `expired` → `active`
- [ ] Se crea/actualiza registro en tabla `subscriptions`
- [ ] Se registra pago en tabla `payments`
- [ ] Email de confirmación se envía (si está configurado)
- [ ] Usuario puede acceder al dashboard
- [ ] Webhook se procesa correctamente
- [ ] Logs muestran el proceso completo

---

## 🛠️ Herramientas Disponibles

### Scripts Creados

1. **`scripts/test-renewal.ts`** - Simula renovación completa
2. **`scripts/test-webhook.ts`** - Prueba webhook localmente
3. **`scripts/simulate-renewal.ts`** - Guía de simulación

### MCP de MercadoPago

- `simulate_webhook` - Simular notificación
- `quality_evaluation` - Evaluar calidad
- `notifications_history` - Ver historial
- `save_webhook` - Configurar webhook
- `search_documentation` - Buscar en docs

---

## 💡 Recomendación

Para probar el flujo completo:

1. **Primero**: Simula estado `expired` en BD
2. **Segundo**: Prueba desde la UI con tarjeta de prueba
3. **Tercero**: Verifica que el webhook se procesa
4. **Cuarto**: Confirma que el estado cambia a `active`

Esto te dará confianza de que todo el flujo funciona correctamente.

---

## 🔍 Verificar Resultado

Después de cualquier método, verifica:

```sql
-- En Supabase SQL Editor
SELECT 
  p.email,
  p.subscription_status,
  s.status,
  s.renewal_date,
  s.start_date
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'marcelo.coliqueo@gmail.com';
```

---

¿Necesitas ayuda con algún método específico? Puedo ayudarte a configurarlo.

