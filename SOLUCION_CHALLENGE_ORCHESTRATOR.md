# Solución: Error "Challenge Orchestrator" en MercadoPago

## 🔴 Problema

Al intentar confirmar un pago en producción, aparece:
- "No pudimos procesar tu pago"
- Mensajes en consola: `Challenge display processing` y `Challenge processing via step next`
- El flujo de "challenge" (validación de seguridad) no se completa

## 🔍 Causas Posibles

### 1. Aplicación No Homologada (Más Probable)

En producción, MercadoPago puede requerir que la aplicación esté **homologada** para procesar pagos reales. El error del MCP indicó que tu aplicación no está homologada.

**Solución:**
1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
2. Selecciona tu aplicación
3. Completa el proceso de **homologación**
4. Asegúrate de que todos los requisitos estén cumplidos:
   - Información de la empresa completa
   - Documentos verificados
   - URLs configuradas correctamente

### 2. Problema con Validación 3D Secure

El "challenge orchestrator" maneja validaciones de seguridad como 3D Secure. Si falla, puede ser porque:
- La tarjeta no soporta 3D Secure
- Hay un problema con la configuración de la aplicación
- El flujo de redirección no está funcionando correctamente

### 3. Configuración de URLs Incorrecta

Si las URLs de redireccionamiento no están configuradas correctamente, el flujo de challenge puede fallar.

**Verifica:**
- ✅ Webhook: `https://microagenda.cl/api/mercadopago-webhook`
- ✅ Success URL: `https://microagenda.cl/dashboard?payment=success`
- ✅ Failure URL: `https://microagenda.cl/dashboard?payment=failure`
- ✅ Pending URL: `https://microagenda.cl/dashboard?payment=pending`

### 4. Token de Producción Inválido

Verifica que el token de producción sea válido:
- Debe empezar con `APP-` (no `TEST-`)
- Debe estar activo en MercadoPago
- Debe tener los permisos necesarios

## 🛠️ Pasos para Diagnosticar

### Paso 1: Revisar Logs de Vercel

1. Ve a Vercel → Tu proyecto → Logs
2. Busca errores cuando se crea la preferencia de preapproval
3. Busca mensajes que contengan:
   - `MercadoPago API error`
   - `create-subscription-preference`
   - Códigos de error 400, 401, 422

### Paso 2: Verificar en la Consola del Navegador

1. Abre la consola (F12)
2. Busca el mensaje: `📦 Resultado de create-subscription-preference:`
3. Verifica si hay errores en la respuesta

### Paso 3: Verificar en MercadoPago

1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app) → Actividad
2. Busca si se está creando la preferencia de preapproval
3. Si se crea, verifica su estado y si hay errores

### Paso 4: Verificar Estado de la Aplicación

1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
2. Selecciona tu aplicación
3. Verifica:
   - Estado de homologación
   - Configuración de webhooks
   - URLs de redireccionamiento

## ✅ Soluciones Implementadas

### 1. Mejorado el Logging

Se agregó logging detallado en `create-subscription-preference/route.ts` para ver exactamente qué está pasando cuando se crea la preferencia.

### 2. Agregado `notification_url`

Ya se agregó el campo `notification_url` que es requerido para webhooks.

## 🔧 Soluciones Adicionales a Probar

### Opción 1: Contactar Soporte de MercadoPago

Si la aplicación no está homologada o hay problemas con el flujo de challenge, contacta al soporte de MercadoPago:
- Email: soporte@mercadopago.cl
- Explica el problema del "challenge orchestrator"
- Menciona que estás usando la API de Preapproval

### Opción 2: Verificar Configuración de la Aplicación

1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
2. Selecciona tu aplicación
3. Verifica:
   - **URLs de redireccionamiento** están configuradas
   - **Webhook** está configurado y accesible
   - **Estado de la aplicación** es "Activa" o "Homologada"

### Opción 3: Probar con Otra Tarjeta

El problema puede ser específico de la tarjeta:
- Prueba con otra tarjeta de crédito
- Prueba con una tarjeta de débito
- Verifica que la tarjeta esté habilitada para pagos online

### Opción 4: Verificar que el Webhook Sea Accesible

El webhook debe ser accesible públicamente:
1. Prueba acceder a: `https://microagenda.cl/api/mercadopago-webhook`
2. Deberías ver: `{"status":"ok"}`
3. Si no es accesible, hay un problema de configuración

## 📋 Checklist de Verificación

Antes de probar de nuevo, verifica:

- [ ] Aplicación homologada en MercadoPago
- [ ] Token de producción válido (`APP-...`)
- [ ] Webhook configurado y accesible
- [ ] URLs de redireccionamiento configuradas
- [ ] Logs mejorados desplegados (✅ Ya hecho)
- [ ] `notification_url` agregado (✅ Ya hecho)

## 🚀 Próximos Pasos

1. **Revisa los logs de Vercel** después de intentar un pago
2. **Comparte los logs** si el problema persiste:
   - Errores de la API de MercadoPago
   - Mensajes de la consola del navegador
   - Estado del pago en MercadoPago

3. **Contacta a MercadoPago** si:
   - La aplicación no está homologada
   - El problema persiste después de verificar todo

## 💡 Nota Importante

El error del "challenge orchestrator" generalmente indica un problema con:
- La configuración de la aplicación en MercadoPago
- El proceso de homologación
- El flujo de validación de seguridad

No es un problema del código, sino de la configuración o el estado de la aplicación en MercadoPago.
