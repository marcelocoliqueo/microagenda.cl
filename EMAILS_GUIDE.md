# 📧 Guía Completa de Emails - MicroAgenda

Esta guía documenta todos los emails disponibles en el sistema y cómo usarlos.

## 📋 Emails Disponibles

### ✅ Emails Existentes (Mejorados)

1. **Recordatorio de Cita (24h antes)**
   - Función: `getAppointmentReminderEmail()`
   - Parámetros: `clientName`, `serviceName`, `date`, `time`, `businessName`, `businessPhone?`
   - Uso: Enviado automáticamente por el cron job de recordatorios

2. **Recordatorio Urgente (2h antes)**
   - Función: `getTwoHourReminderEmail()`
   - Parámetros: `clientName`, `serviceName`, `date`, `time`, `businessName`, `businessPhone?`
   - Uso: Enviado automáticamente por el cron job de recordatorios

3. **Confirmación de Cita**
   - Función: `getAppointmentConfirmationEmail()`
   - Parámetros: `clientName`, `serviceName`, `date`, `time`, `businessName`, `businessPhone?`, `businessAddress?`
   - Uso: Cuando una cita es confirmada (manual o automática)

### 🆕 Nuevos Emails

4. **Bienvenida al Registrarse**
   - Función: `getWelcomeEmail()`
   - Parámetros: `userName`, `businessName?`
   - Uso: Después de que un usuario se registra exitosamente
   - **Pendiente de integrar**: En `app/register/page.tsx`

5. **Notificación de Nueva Reserva (Profesional)**
   - Función: `getNewAppointmentNotificationEmail()`
   - Parámetros: `professionalName`, `clientName`, `clientPhone`, `clientEmail?`, `serviceName`, `date`, `time`, `status`, `appointmentId`
   - Uso: Cuando un cliente crea una reserva desde la página pública
   - **Pendiente de integrar**: En `app/u/[username]/page.tsx` después de crear la reserva

6. **Confirmación de Reserva (Cliente)**
   - Función: `getClientReservationConfirmationEmail()`
   - Parámetros: `clientName`, `clientEmail`, `serviceName`, `date`, `time`, `businessName`, `businessPhone?`, `businessAddress?`, `status`
   - Uso: Cuando un cliente crea una reserva desde la página pública
   - **Pendiente de integrar**: En `app/u/[username]/page.tsx` después de crear la reserva

7. **Cancelación de Cita (Cliente)**
   - Función: `getAppointmentCancellationClientEmail()`
   - Parámetros: `clientName`, `serviceName`, `date`, `time`, `businessName`, `cancelledBy`, `reason?`
   - Uso: Cuando una cita es cancelada
   - **Pendiente de integrar**: En funciones de cancelación de citas

8. **Cancelación de Cita (Profesional)**
   - Función: `getAppointmentCancellationProfessionalEmail()`
   - Parámetros: `professionalName`, `clientName`, `clientPhone`, `serviceName`, `date`, `time`, `cancelledBy`, `reason?`
   - Uso: Cuando una cita es cancelada
   - **Pendiente de integrar**: En funciones de cancelación de citas

9. **Reagendamiento de Cita (Cliente)**
   - Función: `getAppointmentRescheduledClientEmail()`
   - Parámetros: `clientName`, `serviceName`, `oldDate`, `oldTime`, `newDate`, `newTime`, `businessName`, `businessPhone?`
   - Uso: Cuando una cita es reagendada
   - **Pendiente de integrar**: En funciones de reagendamiento

10. **Reagendamiento de Cita (Profesional)**
    - Función: `getAppointmentRescheduledProfessionalEmail()`
    - Parámetros: `professionalName`, `clientName`, `clientPhone`, `serviceName`, `oldDate`, `oldTime`, `newDate`, `newTime`
    - Uso: Cuando una cita es reagendada
    - **Pendiente de integrar**: En funciones de reagendamiento

11. **Pago Exitoso**
    - Función: `getPaymentSuccessEmail()`
    - Parámetros: `userName`, `amount`, `planName`, `nextBillingDate?`
    - Uso: Cuando un pago es procesado exitosamente
    - **Pendiente de integrar**: En `app/api/mercadopago-webhook/route.ts`

12. **Pago Fallido**
    - Función: `getPaymentFailedEmail()`
    - Parámetros: `userName`, `amount`, `planName`, `retryDate?`
    - Uso: Cuando un pago falla
    - **Pendiente de integrar**: En `app/api/mercadopago-webhook/route.ts`

13. **Recordatorio de Pago**
    - Función: `getPaymentReminderEmail()`
    - Parámetros: `userName`, `amount`, `planName`, `dueDate`
    - Uso: Recordatorio antes de que expire la suscripción
    - **Pendiente de integrar**: En un nuevo cron job de recordatorios de pago

14. **No-Show (Cliente No Asistió)**
    - Función: `getNoShowNotificationEmail()`
    - Parámetros: `professionalName`, `clientName`, `serviceName`, `date`, `time`
    - Uso: Cuando se marca una cita como "no asistió"
    - **Pendiente de integrar**: En funciones de actualización de estado de citas

15. **Cita Completada**
    - Función: `getAppointmentCompletedEmail()`
    - Parámetros: `clientName`, `serviceName`, `date`, `time`, `businessName`, `reviewLink?`
    - Uso: Cuando una cita es marcada como completada
    - **Pendiente de integrar**: En funciones de actualización de estado de citas

## 🎨 Características del Diseño

Todos los emails usan un template base moderno con:
- ✅ Diseño responsive (se adapta a móviles)
- ✅ Colores personalizables por tipo de email
- ✅ Badges informativos (éxito, advertencia, error, info)
- ✅ Cajas de información destacadas
- ✅ Botones de acción (CTAs)
- ✅ Footer con información de contacto
- ✅ Compatible con todos los clientes de email

## 📝 Ejemplo de Uso

```typescript
import { sendEmail, getWelcomeEmail } from "@/lib/resendClient";

// Enviar email de bienvenida
const emailHtml = getWelcomeEmail({
  userName: "Juan Pérez",
  businessName: "Salón de Belleza Juan",
});

await sendEmail({
  to: "juan@example.com",
  subject: `¡Bienvenido a ${APP_NAME}!`,
  html: emailHtml,
});
```

## 🔗 Integraciones Pendientes

### 1. Email de Bienvenida
**Archivo**: `app/register/page.tsx`
**Línea**: Después de crear el perfil exitosamente (línea ~68)
```typescript
// Después de actualizar el perfil
const welcomeEmail = getWelcomeEmail({
  userName: formData.name,
  businessName: formData.businessName || undefined,
});

await sendEmail({
  to: authData.user.email!,
  subject: `¡Bienvenido a ${APP_NAME}!`,
  html: welcomeEmail,
});
```

### 2. Emails de Nueva Reserva
**Archivo**: `app/u/[username]/page.tsx`
**Línea**: Después de crear la reserva (línea ~303)
```typescript
// Después de insertar la reserva
// Email al cliente
if (formData.client_email) {
  const clientEmail = getClientReservationConfirmationEmail({
    clientName: formData.client_name,
    clientEmail: formData.client_email,
    serviceName: selectedService.name,
    date: formatDateFriendly(formData.date),
    time: formData.time,
    businessName: profile.business_name || profile.name,
    businessPhone: profile.whatsapp || undefined,
    status: profile.auto_confirm ? "confirmed" : "pending",
  });

  await sendEmail({
    to: formData.client_email,
    subject: "Reserva Creada",
    html: clientEmail,
  });
}

// Email al profesional
const professionalEmail = getNewAppointmentNotificationEmail({
  professionalName: profile.name,
  clientName: formData.client_name,
  clientPhone: formData.client_phone,
  clientEmail: formData.client_email,
  serviceName: selectedService.name,
  date: formatDateFriendly(formData.date),
  time: formData.time,
  status: profile.auto_confirm ? "confirmed" : "pending",
  appointmentId: appointment.id,
});

await sendEmail({
  to: profile.email,
  subject: "Nueva Reserva Recibida",
  html: professionalEmail,
});
```

### 3. Emails de Pago
**Archivo**: `app/api/mercadopago-webhook/route.ts`
**Línea**: Después de procesar el pago exitoso/fallido

### 4. Emails de Cancelación/Reagendamiento
**Archivos**: Funciones de actualización de citas en el dashboard
- `app/dashboard/appointments/page.tsx`
- `hooks/useAppointments.ts`

## 🚀 Próximos Pasos

1. ✅ Templates creados y mejorados
2. ⏳ Integrar emails en los flujos correspondientes
3. ⏳ Probar todos los emails en desarrollo
4. ⏳ Configurar variables de entorno para producción
5. ⏳ Documentar casos de uso específicos

## 📧 Configuración

Asegúrate de tener configurada la variable de entorno:
```
RESEND_API_KEY=tu_api_key_aqui
```

Y la URL de la aplicación:
```
NEXT_PUBLIC_APP_URL=https://microagenda.cl
```

## 🔍 Testing

Para probar los emails localmente sin Resend configurado, los emails se mostrarán en la consola como mock emails.

