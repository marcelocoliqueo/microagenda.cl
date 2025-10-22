# Configuración de MercadoPago para MicroAgenda

Esta guía te ayudará a configurar MercadoPago para procesar suscripciones en MicroAgenda.

## 1. Crear Cuenta en MercadoPago Developer

1. Ve a [MercadoPago Developer](https://www.mercadopago.cl/developers)
2. Inicia sesión con tu cuenta de MercadoPago (o crea una)
3. Si no tienes cuenta de MercadoPago, créala primero en [mercadopago.cl](https://www.mercadopago.cl)

## 2. Crear Aplicación

1. En el panel de Developer, ve a **Tus aplicaciones**
2. Click en **Crear aplicación**
3. Completa:
   - **Nombre de tu aplicación**: MicroAgenda
   - **¿Qué hará tu aplicación?**: Procesar pagos online
   - **Modelo de integración**: Checkout Pro
4. Click en **Crear aplicación**

## 3. Activar Modo Sandbox (Pruebas)

1. En tu aplicación, ve a **Credenciales**
2. Asegúrate de estar en modo **Prueba** (toggle superior)
3. Copia el **Access Token de prueba**
4. Pégalo en tu `.env.local`:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-123456789
```

## 4. Usuarios de Prueba

Para probar pagos, necesitas usuarios de prueba:

1. Ve a **Usuarios de prueba** en el menú
2. Click en **Crear usuario de prueba**
3. Crea dos usuarios:
   - **Vendedor**: Para recibir pagos
   - **Comprador**: Para hacer pagos de prueba

## 5. Tarjetas de Prueba (Chile)

Usa estas tarjetas para probar en modo sandbox:

### Visa

- **Número**: 4509 9535 6623 3704
- **CVV**: 123
- **Fecha de vencimiento**: Cualquier fecha futura (ej: 12/25)
- **Estado**: Aprobado

### Mastercard

- **Número**: 5031 7557 3453 0604
- **CVV**: 123
- **Fecha de vencimiento**: Cualquier fecha futura
- **Estado**: Aprobado

### Tarjeta Rechazada (para probar errores)

- **Número**: 4013 5406 8274 6260
- **CVV**: 123
- **Fecha de vencimiento**: Cualquier fecha futura
- **Estado**: Rechazado

## 6. Configurar Webhook (IMPORTANTE)

El webhook notifica a tu app cuando un pago es procesado.

### Durante Desarrollo (localhost)

1. Usa [ngrok](https://ngrok.com) o similar para exponer tu localhost:

```bash
npm install -g ngrok
ngrok http 3000
```

2. Copia la URL de ngrok (ej: `https://abc123.ngrok.io`)
3. En MercadoPago Developer → **Webhooks**:
   - URL de notificación: `https://abc123.ngrok.io/api/mercadopago-webhook`
   - Eventos: **Pagos**

### En Producción (Vercel)

1. Después de deployar en Vercel, copia tu URL
2. En MercadoPago Developer → **Webhooks**:
   - URL de notificación: `https://tu-dominio.vercel.app/api/mercadopago-webhook`
   - Eventos: **Pagos**
3. Actualiza tu `.env.local` en Vercel:

```env
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.vercel.app/api/mercadopago-webhook
```

## 7. Probar el Flujo de Pago

### Paso 1: Activar Suscripción

1. Registra una cuenta de prueba en tu app
2. En el dashboard, click en **Activar Suscripción**
3. Serás redirigido a MercadoPago Checkout

### Paso 2: Completar Pago

1. Usa una tarjeta de prueba
2. Completa el formulario con datos ficticios:
   - **Titular**: Juan Pérez
   - **Email**: test@test.com
   - **DNI/RUT**: 12345678-9
3. Click en **Pagar**

### Paso 3: Verificar Webhook

1. Revisa los logs de tu aplicación
2. Deberías ver: `"MercadoPago Webhook received"`
3. El estado de suscripción del usuario debería cambiar a "active"

### Paso 4: Verificar en MercadoPago

1. Ve a **Actividad** en tu panel de MercadoPago
2. Deberías ver el pago de prueba

## 8. Monitorear Pagos

### Durante Desarrollo

Revisa los logs en tu terminal:

```bash
npm run dev
# Los webhooks se mostrarán en la consola
```

### En Producción

1. Ve a Vercel → Tu proyecto → **Logs**
2. O usa MercadoPago → **Actividad** para ver pagos procesados

## 9. Producción: Activar Credenciales Reales

⚠️ **SOLO cuando estés listo para cobrar dinero real:**

1. Ve a **Credenciales** en tu aplicación
2. Cambia a modo **Producción**
3. Copia el **Access Token de producción**
4. Actualiza en Vercel:

```env
MERCADOPAGO_ACCESS_TOKEN=APP-1234567890-abcdef-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-123456789
```

5. Verifica que el webhook esté configurado en modo producción

## 10. Requisitos para Producción

Para activar modo producción en MercadoPago necesitas:

- ✅ Cuenta de MercadoPago verificada (con RUT/DNI)
- ✅ Datos bancarios configurados para recibir pagos
- ✅ Información fiscal completa
- ✅ Términos y condiciones aceptados

## 11. Comisiones de MercadoPago (Chile)

MercadoPago cobra comisiones por transacción:

- **Checkout Pro**: ~3.49% + IVA por transacción exitosa
- **Sin costo mensual** de mantención

Para suscripción de $6.490 CLP:

- Comisión aproximada: $227 CLP
- Recibes: $6.263 CLP

## 12. Suscripciones Recurrentes

⚠️ **Nota importante**: Este proyecto usa **pagos únicos** mensuales, no suscripciones automáticas recurrentes.

Si deseas implementar cobros automáticos mensuales:

1. Usa [MercadoPago Subscriptions API](https://www.mercadopago.cl/developers/es/docs/subscriptions/overview)
2. Requiere implementación adicional
3. Usuarios autorizan débito automático mensual

## 13. Testing Checklist

Antes de ir a producción, prueba:

- [x] Pago exitoso con tarjeta válida
- [x] Pago rechazado con tarjeta inválida
- [x] Webhook recibe notificación correctamente
- [x] Estado de suscripción se actualiza en la BD
- [x] Usuario puede acceder al dashboard después del pago
- [x] Email de confirmación se envía (si implementado)

## 14. Errores Comunes

### Error: "Invalid access token"

- Solución: Verifica que copiaste el Access Token correcto (TEST para sandbox)

### Webhook no se ejecuta

- Solución:
  1. Verifica que la URL del webhook sea correcta
  2. Verifica que el endpoint esté público (no requiera auth)
  3. Revisa logs de Vercel/localhost

### Pago aprobado pero suscripción no activa

- Solución:
  1. Revisa logs del webhook
  2. Verifica que el user_id esté en el external_reference
  3. Verifica que la tabla subscriptions tenga RLS correcto

## 15. Seguridad

### Validar Webhooks (Recomendado para Producción)

MercadoPago firma los webhooks. Para validar:

```typescript
// TODO: Implementar validación de firma
// Documentación: https://www.mercadopago.cl/developers/es/docs/checkout-api/webhooks
```

## Recursos Adicionales

- [Documentación MercadoPago Chile](https://www.mercadopago.cl/developers/es/docs)
- [API Reference](https://www.mercadopago.cl/developers/es/reference)
- [SDKs y Librerías](https://www.mercadopago.cl/developers/es/docs/sdks-library/landing)
- [Soporte Developer](https://www.mercadopago.cl/developers/es/support)

## Soporte

Si tienes problemas:

1. Revisa [FAQ de MercadoPago](https://www.mercadopago.cl/ayuda)
2. Contacta soporte: [www.mercadopago.cl/ayuda/contacto](https://www.mercadopago.cl/ayuda/contacto)
3. Foro de desarrolladores en MercadoPago

---

¡Listo! MercadoPago está configurado para procesar pagos en MicroAgenda.
