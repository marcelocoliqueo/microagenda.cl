# Solución: Problema con Pagos en Producción de MercadoPago

## 🔴 Problema Reportado

- El botón "Confirmar" aparece bloqueado
- Cuando se desbloquea y se hace clic, el pago no se puede realizar
- Estás probando en producción con dinero real
- Probaste con dos tarjetas (crédito y débito)

## ✅ Cambios Realizados

### 1. Agregado `notification_url` a las preferencias de preapproval

**Archivos modificados:**
- `lib/mercadopagoClient.ts`
- `app/api/create-subscription-preference/route.ts`

**Cambio:**
Se agregó el campo `notification_url` que es **requerido** para recibir webhooks de MercadoPago en producción:

```typescript
notification_url: `${APP_URL}/api/mercadopago-webhook`,
```

Este campo permite que MercadoPago notifique a tu aplicación cuando:
- Se autoriza una suscripción
- Se procesa un pago
- Cambia el estado de un pago

## 🔍 Posibles Causas Adicionales

### 1. Aplicación No Homologada

El MCP de MercadoPago indicó que tu aplicación no está homologada. En producción, MercadoPago puede requerir que la aplicación esté homologada para procesar pagos reales.

**Solución:**
1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
2. Completa el proceso de homologación de tu aplicación
3. Asegúrate de que todos los requisitos estén cumplidos

### 2. Validación de Datos en Producción

En producción, MercadoPago tiene validaciones más estrictas que en sandbox. El botón puede estar bloqueado porque:

- **Falta información del comprador**: En producción, MercadoPago puede requerir más datos
- **Validación de tarjeta más estricta**: Las tarjetas reales pasan por validaciones adicionales
- **Problemas con el email del pagador**: Debe ser un email válido y verificado

### 3. Configuración de la Aplicación

Verifica en [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app) que:

- ✅ **Webhook configurado**: `https://microagenda.cl/api/mercadopago-webhook`
- ✅ **URLs de redireccionamiento configuradas**:
  - Success: `https://microagenda.cl/dashboard?payment=success`
  - Failure: `https://microagenda.cl/dashboard?payment=failure`
  - Pending: `https://microagenda.cl/dashboard?payment=pending`
- ✅ **Token de producción válido**: Debe empezar con `APP-` (no `TEST-`)

### 4. Problemas con el Formato de Datos

En producción, verifica que:

- ✅ El `payer_email` sea un email válido
- ✅ El `transaction_amount` esté en el formato correcto (número, no string)
- ✅ El `currency_id` sea `"CLP"` (mayúsculas)
- ✅ El `start_date` esté en formato ISO válido

## 🛠️ Pasos para Diagnosticar

### Paso 1: Verificar Logs de Vercel

1. Ve a Vercel → Tu proyecto → Logs
2. Busca errores relacionados con MercadoPago cuando intentas crear la preferencia
3. Revisa si hay errores 400, 401, o 422 de la API de MercadoPago

### Paso 2: Verificar Respuesta de la API

Abre la consola del navegador (F12) y busca:
- `📦 Resultado de create-subscription-preference:`
- Si hay errores, aparecerán en rojo

### Paso 3: Verificar en MercadoPago

1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app) → Actividad
2. Busca si se está creando la preferencia de preapproval
3. Verifica si hay errores en la creación

### Paso 4: Probar con el MCP de MercadoPago

Usa el MCP para verificar:
- Estado de la aplicación
- Configuración de webhooks
- Historial de notificaciones

## 🔧 Soluciones Adicionales

### Si el botón sigue bloqueado:

1. **Verifica que todos los campos estén completos**:
   - Número de tarjeta completo (16 dígitos)
   - CVV (3 dígitos)
   - Fecha de vencimiento seleccionada
   - Nombre del titular
   - Documento completo
   - Email válido

2. **Prueba en modo incógnito** para descartar problemas de caché

3. **Verifica la consola del navegador** (F12) para errores de JavaScript

### Si el pago se rechaza después de confirmar:

1. **Revisa los logs del webhook** en Vercel
2. **Verifica en MercadoPago** el estado del pago:
   - Ve a Actividad → Busca el pago
   - Revisa el motivo del rechazo
3. **Verifica que la tarjeta tenga fondos** y esté habilitada para pagos online

## 📋 Checklist de Verificación

Antes de probar de nuevo, verifica:

- [ ] `notification_url` agregado a las preferencias (✅ Ya hecho)
- [ ] Token de producción configurado en Vercel (`APP-...`)
- [ ] Webhook configurado en MercadoPago
- [ ] URLs de redireccionamiento configuradas
- [ ] Aplicación homologada (si es requerido)
- [ ] Email del pagador es válido
- [ ] Monto del plan es correcto
- [ ] Moneda es `CLP`

## 🚀 Próximos Pasos

1. **Despliega los cambios** a producción:
   ```bash
   git add .
   git commit -m "Agregar notification_url a preferencias de preapproval"
   git push
   ```

2. **Espera a que Vercel despliegue** (1-2 minutos)

3. **Prueba de nuevo** el flujo de pago

4. **Revisa los logs** si sigue fallando

## 📞 Si Aún No Funciona

Comparte:
1. Los logs de Vercel (especialmente errores de la API de MercadoPago)
2. Los mensajes de la consola del navegador
3. El estado del pago en MercadoPago (si se creó)
4. El error exacto que aparece cuando intentas confirmar

## 💡 Nota Importante

En producción, MercadoPago puede tener validaciones adicionales que no existen en sandbox. Si el problema persiste después de estos cambios, puede ser necesario:

1. Contactar al soporte de MercadoPago
2. Verificar que tu cuenta de MercadoPago esté completamente verificada
3. Asegurarte de que tu aplicación cumpla con todos los requisitos de homologación
