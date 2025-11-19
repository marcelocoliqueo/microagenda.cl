# 📧 Integración Completa de Emails con Resend

## ✅ Estado de Integración

### Emails Integrados y Funcionando:

1. **✅ Email de Bienvenida**
   - **Cuándo**: Al registrarse exitosamente
   - **Archivo**: `app/register/page.tsx`
   - **API**: `/api/send-welcome-email`

2. **✅ Emails de Nueva Reserva**
   - **Cuándo**: Cuando un cliente crea una reserva desde la página pública
   - **Archivo**: `app/u/[username]/page.tsx`
   - **API**: `/api/send-new-reservation-emails`
   - **Envíos**: 
     - Email al cliente (si tiene email)
     - Email al profesional

3. **✅ Email de Confirmación Manual**
   - **Cuándo**: Cuando el profesional confirma manualmente una cita pendiente
   - **Archivo**: `app/dashboard/appointments/page.tsx`
   - **API**: `/api/send-appointment-email`
   - **Tipo**: `manual-confirmation`

4. **✅ Emails de Cancelación**
   - **Cuándo**: Cuando una cita es cancelada
   - **Archivo**: `app/dashboard/appointments/page.tsx`
   - **API**: `/api/send-appointment-email`
   - **Tipos**: `cancellation-client`, `cancellation-professional`

5. **✅ Email de Cambio de Contraseña**
   - **Cuándo**: Después de resetear contraseña
   - **Archivo**: `app/reset-password/page.tsx`
   - **API**: `/api/send-password-changed-email`

6. **✅ Recordatorios Automáticos** (Ya existían)
   - **Cuándo**: 24h y 2h antes de la cita
   - **Archivo**: `app/api/send-reminders/route.ts`
   - **Cron**: Llamado automáticamente

## 🔧 Configuración de Resend

### 1. Obtener API Key

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta (gratis hasta 3,000 emails/mes)
3. Ve a **API Keys** → **Create API Key**
4. Copia la API key

### 2. Configurar Variables de Entorno

#### Desarrollo (`.env.local`):
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Producción (Vercel):
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega:
   - `RESEND_API_KEY` = `re_xxxxxxxxxxxxx`
   - `NEXT_PUBLIC_APP_URL` = `https://microagenda.cl`
4. Marca: Production, Preview, Development
5. Click **Save**

### 3. Verificar Dominio (Opcional pero Recomendado)

Para usar `noreply@microagenda.cl`:
1. Ve a **Domains** en Resend
2. Agrega `microagenda.cl`
3. Configura los registros DNS (SPF, DKIM)
4. Espera verificación (hasta 24h)

**Nota**: Mientras tanto puedes usar `onboarding@resend.dev`

### 4. Actualizar Base de Datos

Ejecuta en Supabase SQL Editor:
```sql
-- Agregar campo client_email a appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS client_email TEXT;
```

O ejecuta el archivo: `schema_update_add_client_email.sql`

## 📋 Flujos de Email

### Flujo 1: Registro
```
Usuario se registra
  ↓
Perfil creado
  ↓
Email confirmado? → SÍ → Enviar email de bienvenida
  ↓
Redirigir a dashboard
```

### Flujo 2: Nueva Reserva (Página Pública)
```
Cliente completa formulario
  ↓
Reserva creada en BD
  ↓
¿Cliente tiene email? → SÍ → Email de confirmación al cliente
  ↓
Email de notificación al profesional
```

### Flujo 3: Confirmación Manual
```
Profesional cambia estado: pending → confirmed
  ↓
¿Cliente tiene email? → SÍ → Email de confirmación manual
```

### Flujo 4: Cancelación
```
Profesional cambia estado a "cancelled"
  ↓
Email de cancelación al cliente (si tiene email)
  ↓
Email de cancelación al profesional
```

### Flujo 5: Reset de Contraseña
```
Usuario solicita reset
  ↓
Supabase envía email con enlace
  ↓
Usuario cambia contraseña
  ↓
Email de confirmación de cambio
```

## 🧪 Testing

### Sin Resend Configurado:
- Los emails se muestran en la consola del servidor
- Formato: `📧 [MOCK EMAIL]`
- Útil para desarrollo local

### Con Resend Configurado:
- Los emails se envían realmente
- Revisa el dashboard de Resend para logs
- Verifica que lleguen a la bandeja de entrada

## 📊 APIs Disponibles

### `/api/send-email`
Helper genérico para enviar cualquier email
```typescript
await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to, subject, html })
})
```

### `/api/send-welcome-email`
Email de bienvenida
```typescript
await fetch('/api/send-welcome-email', {
  method: 'POST',
  body: JSON.stringify({ userEmail, userName, businessName })
})
```

### `/api/send-new-reservation-emails`
Emails de nueva reserva
```typescript
await fetch('/api/send-new-reservation-emails', {
  method: 'POST',
  body: JSON.stringify({ appointmentId, type: 'client' | 'professional' })
})
```

### `/api/send-appointment-email`
Emails relacionados con citas
```typescript
await fetch('/api/send-appointment-email', {
  method: 'POST',
  body: JSON.stringify({ 
    type: 'manual-confirmation' | 'cancellation-client' | 'cancellation-professional',
    appointmentId 
  })
})
```

## ⚠️ Notas Importantes

1. **Los emails no bloquean el flujo**: Si falla el envío, el usuario no ve error
2. **Campo client_email es opcional**: Si no hay email, simplemente no se envía
3. **Mock mode**: Sin `RESEND_API_KEY`, los emails se muestran en consola
4. **Rate limits**: Plan gratuito = 100 emails/día, 3,000/mes

## 🚀 Próximos Pasos (Opcionales)

- [ ] Integrar emails de reagendamiento
- [ ] Integrar emails de pago (MercadoPago webhook)
- [ ] Agregar email de resumen semanal
- [ ] Personalizar remitente con dominio verificado

