# Diagnóstico: Error 502 en Webhook de MercadoPago

## 🔴 Problema Identificado

El MCP de MercadoPago muestra:
- **1 notificación fallida** con error **502 (Bad Gateway)**
- Fecha: 2025-12-10 23:14
- El webhook está recibiendo notificaciones, pero el servidor responde con 502

## 🔍 ¿Qué significa Error 502?

Un error 502 (Bad Gateway) generalmente significa:
- El servidor no está disponible o no responde
- El servidor está sobrecargado
- Hay un problema con el endpoint
- El servidor está tardando demasiado en responder (timeout)

## ✅ Verificaciones Necesarias

### 1. Verificar que el Endpoint Esté Accesible

```bash
curl -I https://microagenda.cl/api/mercadopago-webhook
```

Debería retornar:
- `200 OK` si está funcionando
- `405 Method Not Allowed` si solo acepta POST (también es válido)

### 2. Verificar Logs de Vercel

Aunque no veas errores, busca:
- Logs del webhook: `MercadoPago Webhook received`
- Errores de timeout
- Errores de procesamiento

### 3. Verificar Tiempo de Respuesta

El webhook debe responder rápidamente (< 5 segundos). Si tarda más, MercadoPago puede marcar como error 502.

## 🛠️ Posibles Causas

### 1. Timeout del Webhook

Si el webhook tarda demasiado en procesar:
- MercadoPago puede marcar como 502
- El procesamiento puede estar tardando mucho

**Solución:** Verificar que el webhook responda rápidamente

### 2. Error en el Procesamiento

Si hay un error al procesar el webhook:
- Puede causar un 502
- El error puede no aparecer en los logs si ocurre antes de loguear

**Solución:** Agregar try-catch más robusto

### 3. Problema con Supabase

Si hay un problema al conectar con Supabase:
- Puede causar timeout
- Puede causar 502

**Solución:** Verificar conexión con Supabase

## 🔧 Soluciones

### Solución 1: Agregar Timeout y Mejor Manejo de Errores

El webhook debe responder rápidamente. Si el procesamiento tarda mucho, debería:
1. Responder 200 inmediatamente
2. Procesar en background (si es necesario)

### Solución 2: Verificar Estado del Webhook en MercadoPago

1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
2. Selecciona tu aplicación
3. Ve a **Webhooks**
4. Verifica:
   - URL configurada: `https://microagenda.cl/api/mercadopago-webhook`
   - Estado del webhook
   - Historial de notificaciones

### Solución 3: Probar el Webhook Manualmente

Puedes usar el MCP de MercadoPago para simular un webhook y ver si funciona:

```typescript
mcp_mercadopago-mcp-server_simulate_webhook({
  resource_id: "PAYMENT_ID",
  topic: "payment",
  callback_env_production: true
})
```

## 📋 Checklist de Diagnóstico

- [ ] Endpoint accesible: `curl -I https://microagenda.cl/api/mercadopago-webhook`
- [ ] Logs de Vercel revisados (buscar "MercadoPago Webhook received")
- [ ] Estado del webhook en MercadoPago verificado
- [ ] Tiempo de respuesta del webhook < 5 segundos
- [ ] Conexión con Supabase funcionando

## 🚀 Próximos Pasos

1. **Verificar el endpoint** con curl
2. **Revisar logs de Vercel** buscando el webhook específico
3. **Verificar en MercadoPago** el estado del webhook
4. **Probar manualmente** con el MCP si es necesario

## 💡 Nota Importante

El error 502 puede ser:
- **Temporal**: Si el servidor estaba sobrecargado
- **Permanente**: Si hay un problema con el código o configuración

Si el error es reciente (2025-12-10 23:14), puede ser que:
- El servidor estaba sobrecargado en ese momento
- Hubo un problema temporal con Vercel
- El webhook tardó demasiado en responder

Si el problema persiste, necesitamos:
1. Ver los logs específicos de ese momento
2. Verificar si el webhook está respondiendo correctamente ahora
3. Mejorar el manejo de errores en el webhook
