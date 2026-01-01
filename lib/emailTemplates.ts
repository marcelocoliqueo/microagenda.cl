import { APP_NAME, SUPPORT_EMAIL } from "./constants";

/**
 * Template base para todos los emails
 * Diseño moderno, responsive y profesional
 */
function getBaseEmailTemplate({
  title,
  content,
  primaryColor = "#10B981",
  accentColor = "#84CC16",
}: {
  title: string;
  content: string;
  primaryColor?: string;
  accentColor?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      background-color: #F3F4F6;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      padding: 40px 30px;
      text-align: center;
      color: #FFFFFF;
    }
    .email-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      color: #FFFFFF;
    }
    .email-header .logo {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .email-content {
      padding: 40px 30px;
    }
    .email-content p {
      margin-bottom: 16px;
      color: #374151;
      font-size: 16px;
    }
    .email-content strong {
      color: #111827;
      font-weight: 600;
    }
    .info-box {
      background-color: #F9FAFB;
      border-left: 4px solid ${primaryColor};
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .info-box ul {
      margin: 0;
      padding-left: 20px;
    }
    .info-box li {
      margin-bottom: 8px;
      color: #374151;
    }
    .info-box li:last-child {
      margin-bottom: 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      color: #FFFFFF;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      transition: opacity 0.2s;
    }
    .button:hover {
      opacity: 0.9;
    }
    .button-secondary {
      background: #F3F4F6;
      color: #374151;
      border: 1px solid #E5E7EB;
    }
    .button-secondary:hover {
      background: #E5E7EB;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin: 10px 0;
    }
    .badge-success {
      background-color: #D1FAE5;
      color: #065F46;
    }
    .badge-warning {
      background-color: #FEF3C7;
      color: #92400E;
    }
    .badge-error {
      background-color: #FEE2E2;
      color: #991B1B;
    }
    .badge-info {
      background-color: #DBEAFE;
      color: #1E40AF;
    }
    .divider {
      height: 1px;
      background-color: #E5E7EB;
      margin: 30px 0;
    }
    .email-footer {
      background-color: #F9FAFB;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 14px;
    }
    .email-footer p {
      margin-bottom: 8px;
    }
    .email-footer a {
      color: ${primaryColor};
      text-decoration: none;
    }
    .email-footer a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0;
      }
      .email-header,
      .email-content,
      .email-footer {
        padding: 24px 20px !important;
      }
      .email-header h1 {
        font-size: 24px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo">📅</div>
      <h1>${title}</h1>
    </div>
    <div class="email-content">
      ${content}
    </div>
    <div class="email-footer">
      <p><strong>${APP_NAME}</strong></p>
      <p>Tu agenda simple y profesional</p>
      <div class="divider"></div>
      <p>¿Necesitas ayuda? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      <p style="margin-top: 16px; font-size: 12px; color: #9CA3AF;">
        Este es un email automático, por favor no respondas a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// EMAILS EXISTENTES MEJORADOS
// ============================================

export function getAppointmentReminderEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  businessPhone?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <p>Este es un recordatorio de tu cita próxima:</p>
    <div class="info-box">
      <ul>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
        <li><strong>Profesional:</strong> ${params.businessName}</li>
        ${params.businessPhone ? `<li><strong>Teléfono:</strong> ${params.businessPhone}</li>` : ''}
      </ul>
    </div>
    <p>Te esperamos puntualmente. Si necesitas cancelar o reprogramar, por favor contáctanos con anticipación.</p>
    <p>¡Nos vemos pronto!</p>
  `;

  return getBaseEmailTemplate({
    title: "Recordatorio de Cita",
    content,
    primaryColor: "#3B82F6",
    accentColor: "#60A5FA",
  });
}

export function getTwoHourReminderEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  businessPhone?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <div class="badge badge-warning">⏰ Recordatorio Urgente</div>
    <p><strong>¡Tu cita es en 2 horas!</strong></p>
    <div class="info-box">
      <ul>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
        <li><strong>Profesional:</strong> ${params.businessName}</li>
        ${params.businessPhone ? `<li><strong>Teléfono:</strong> ${params.businessPhone}</li>` : ''}
      </ul>
    </div>
    <p><strong>⏱️ Recuerda llegar con algunos minutos de anticipación.</strong></p>
    <p>Si tienes alguna consulta o necesitas cancelar, por favor contáctanos lo antes posible.</p>
    <p>¡Te esperamos!</p>
  `;

  return getBaseEmailTemplate({
    title: "⏰ ¡Tu cita es en 2 horas!",
    content,
    primaryColor: "#F59E0B",
    accentColor: "#D97706",
  });
}

export function getAppointmentConfirmationEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  businessPhone?: string;
  businessAddress?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <div class="badge badge-success">✅ Cita Confirmada</div>
    <p>Tu cita ha sido confirmada exitosamente:</p>
    <div class="info-box">
      <ul>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
        <li><strong>Profesional:</strong> ${params.businessName}</li>
        ${params.businessPhone ? `<li><strong>Teléfono:</strong> ${params.businessPhone}</li>` : ''}
        ${params.businessAddress ? `<li><strong>Dirección:</strong> ${params.businessAddress}</li>` : ''}
      </ul>
    </div>
    <p>Recibirás recordatorios automáticos 24 horas y 2 horas antes de tu cita.</p>
    <p>¡Te esperamos!</p>
  `;

  return getBaseEmailTemplate({
    title: "¡Cita Confirmada!",
    content,
  });
}

// ============================================
// NUEVOS EMAILS
// ============================================

/**
 * Email de bienvenida al registrarse
 */
export function getWelcomeEmail(params: {
  userName: string;
  businessName?: string;
}): string {
  const content = `
    <p>¡Hola <strong>${params.userName}</strong>!</p>
    <p>Bienvenido a <strong>${APP_NAME}</strong>. Estamos emocionados de tenerte con nosotros.</p>
    <p>Con ${APP_NAME} podrás:</p>
    <div class="info-box">
      <ul>
        <li>✅ Gestionar tus reservas de forma simple y profesional</li>
        <li>✅ Recibir notificaciones automáticas de tus citas</li>
        <li>✅ Personalizar tu agenda con tu marca</li>
        <li>✅ Compartir tu link de reservas con tus clientes</li>
      </ul>
    </div>
    <p>${params.businessName ? `Tu negocio "${params.businessName}" está listo para recibir reservas.` : 'Tu cuenta está lista para comenzar.'}</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard" class="button">
        Ir a mi Dashboard
      </a>
    </p>
    <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
  `;

  return getBaseEmailTemplate({
    title: `¡Bienvenido a ${APP_NAME}!`,
    content,
  });
}

/**
 * Email al profesional cuando se crea una nueva reserva
 */
export function getNewAppointmentNotificationEmail(params: {
  professionalName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed";
  appointmentId: string;
}): string {
  const statusBadge = params.status === "confirmed"
    ? '<div class="badge badge-success">✅ Confirmada</div>'
    : '<div class="badge badge-warning">⏳ Pendiente de Confirmación</div>';

  const content = `
    <p>Hola <strong>${params.professionalName}</strong>,</p>
    <p>Has recibido una nueva reserva:</p>
    ${statusBadge}
    <div class="info-box">
      <ul>
        <li><strong>Cliente:</strong> ${params.clientName}</li>
        <li><strong>Teléfono:</strong> ${params.clientPhone}</li>
        ${params.clientEmail ? `<li><strong>Email:</strong> ${params.clientEmail}</li>` : ''}
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
      </ul>
    </div>
    ${params.status === "pending"
      ? `<p>Esta reserva está pendiente de confirmación. Revisa tu dashboard para confirmarla o contactar al cliente.</p>`
      : `<p>Esta reserva ha sido confirmada automáticamente.</p>`
    }
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard/appointments" class="button">
        Ver en Dashboard
      </a>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Nueva Reserva Recibida",
    content,
    primaryColor: "#8B5CF6",
    accentColor: "#A78BFA",
  });
}

/**
 * Email de confirmación de reserva al cliente (desde página pública)
 */
export function getClientReservationConfirmationEmail(params: {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  businessPhone?: string;
  businessAddress?: string;
  status: "pending" | "confirmed";
}): string {
  const statusMessage = params.status === "confirmed"
    ? "Tu reserva ha sido confirmada automáticamente."
    : "Tu reserva está pendiente de confirmación. Recibirás un email cuando sea confirmada.";

  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <div class="badge badge-success">✅ Reserva Creada</div>
    <p>${statusMessage}</p>
    <div class="info-box">
      <ul>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
        <li><strong>Profesional:</strong> ${params.businessName}</li>
        ${params.businessPhone ? `<li><strong>Teléfono:</strong> ${params.businessPhone}</li>` : ''}
        ${params.businessAddress ? `<li><strong>Dirección:</strong> ${params.businessAddress}</li>` : ''}
      </ul>
    </div>
    ${params.status === "confirmed"
      ? `<p>Recibirás recordatorios automáticos 24 horas y 2 horas antes de tu cita.</p>`
      : `<p>Te notificaremos por email cuando tu reserva sea confirmada.</p>`
    }
    <p>Si necesitas hacer algún cambio o cancelar, por favor contacta directamente al profesional.</p>
    <p>¡Gracias por confiar en nosotros!</p>
  `;

  return getBaseEmailTemplate({
    title: "Reserva Creada",
    content,
  });
}

/**
 * Email de cancelación de cita (cliente)
 */
export function getAppointmentCancellationClientEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  cancelledBy: "client" | "professional";
  reason?: string;
}): string {
  const cancelledByText = params.cancelledBy === "client"
    ? "has cancelado"
    : "ha sido cancelada por el profesional";

  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <div class="badge badge-error">❌ Cita Cancelada</div>
    <p>Tu cita ${cancelledByText}:</p>
    <div class="info-box">
      <ul>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
        <li><strong>Profesional:</strong> ${params.businessName}</li>
      </ul>
    </div>
    ${params.reason ? `<p><strong>Motivo:</strong> ${params.reason}</p>` : ''}
    <p>Si deseas reagendar, puedes hacerlo desde el link de reservas del profesional.</p>
    <p>Si tienes alguna consulta, no dudes en contactarnos.</p>
  `;

  return getBaseEmailTemplate({
    title: "Cita Cancelada",
    content,
    primaryColor: "#EF4444",
    accentColor: "#F87171",
  });
}

/**
 * Email de cancelación de cita (profesional)
 */
export function getAppointmentCancellationProfessionalEmail(params: {
  professionalName: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
  cancelledBy: "client" | "professional";
  reason?: string;
}): string {
  const cancelledByText = params.cancelledBy === "client"
    ? "El cliente ha cancelado"
    : "Has cancelado";

  const content = `
    <p>Hola <strong>${params.professionalName}</strong>,</p>
    <div class="badge badge-error">❌ Cita Cancelada</div>
    <p>${cancelledByText} la siguiente cita:</p>
    <div class="info-box">
      <ul>
        <li><strong>Cliente:</strong> ${params.clientName}</li>
        <li><strong>Teléfono:</strong> ${params.clientPhone}</li>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
      </ul>
    </div>
    ${params.reason ? `<p><strong>Motivo:</strong> ${params.reason}</p>` : ''}
    <p>El cliente ha sido notificado automáticamente.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard/appointments" class="button">
        Ver en Dashboard
      </a>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Cita Cancelada",
    content,
    primaryColor: "#EF4444",
    accentColor: "#F87171",
  });
}

/**
 * Email de cambio de cita (cliente)
 */
export function getAppointmentRescheduledClientEmail(params: {
  clientName: string;
  serviceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  businessName: string;
  businessPhone?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <div class="badge badge-info">🔄 Cita Reagendada</div>
    <p>Tu cita ha sido reagendada:</p>
    <div class="info-box">
      <p><strong>Servicio:</strong> ${params.serviceName}</p>
      <p><strong>Fecha anterior:</strong> ${params.oldDate} a las ${params.oldTime}</p>
      <p><strong>Nueva fecha:</strong> ${params.newDate} a las ${params.newTime}</p>
      <p><strong>Profesional:</strong> ${params.businessName}</p>
      ${params.businessPhone ? `<p><strong>Teléfono:</strong> ${params.businessPhone}</p>` : ''}
    </div>
    <p>Recibirás recordatorios automáticos con la nueva fecha y hora.</p>
    <p>Si tienes alguna consulta, no dudes en contactar al profesional.</p>
    <p>¡Te esperamos!</p>
  `;

  return getBaseEmailTemplate({
    title: "Cita Reagendada",
    content,
    primaryColor: "#3B82F6",
    accentColor: "#60A5FA",
  });
}

/**
 * Email de cambio de cita (profesional)
 */
export function getAppointmentRescheduledProfessionalEmail(params: {
  professionalName: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}): string {
  const content = `
    <p>Hola <strong>${params.professionalName}</strong>,</p>
    <div class="badge badge-info">🔄 Cita Reagendada</div>
    <p>Has reagendado la siguiente cita:</p>
    <div class="info-box">
      <ul>
        <li><strong>Cliente:</strong> ${params.clientName}</li>
        <li><strong>Teléfono:</strong> ${params.clientPhone}</li>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha anterior:</strong> ${params.oldDate} a las ${params.oldTime}</li>
        <li><strong>Nueva fecha:</strong> ${params.newDate} a las ${params.newTime}</li>
      </ul>
    </div>
    <p>El cliente ha sido notificado automáticamente con los nuevos detalles.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard/appointments" class="button">
        Ver en Dashboard
      </a>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Cita Reagendada",
    content,
    primaryColor: "#3B82F6",
    accentColor: "#60A5FA",
  });
}

/**
 * Email de notificación de pago exitoso
 */
export function getPaymentSuccessEmail(params: {
  userName: string;
  amount: string;
  planName: string;
  nextBillingDate?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.userName}</strong>,</p>
    <div class="badge badge-success">✅ Pago Exitoso</div>
    <p>Tu pago ha sido procesado correctamente:</p>
    <div class="info-box">
      <ul>
        <li><strong>Plan:</strong> ${params.planName}</li>
        <li><strong>Monto:</strong> ${params.amount}</li>
        ${params.nextBillingDate ? `<li><strong>Próximo cobro:</strong> ${params.nextBillingDate}</li>` : ''}
      </ul>
    </div>
    <p>Gracias por confiar en ${APP_NAME}. Tu suscripción está activa y puedes disfrutar de todas las funcionalidades.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard" class="button">
        Ir a mi Dashboard
      </a>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Pago Exitoso",
    content,
  });
}

/**
 * Email de notificación de pago fallido
 */
export function getPaymentFailedEmail(params: {
  userName: string;
  amount: string;
  planName: string;
  retryDate?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.userName}</strong>,</p>
    <div class="badge badge-error">⚠️ Pago Fallido</div>
    <p>No pudimos procesar tu pago:</p>
    <div class="info-box">
      <ul>
        <li><strong>Plan:</strong> ${params.planName}</li>
        <li><strong>Monto:</strong> ${params.amount}</li>
        ${params.retryDate ? `<li><strong>Próximo intento:</strong> ${params.retryDate}</li>` : ''}
      </ul>
    </div>
    <p>Por favor, verifica que tu método de pago tenga fondos suficientes y que los datos estén correctos.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard" class="button">
        Actualizar Método de Pago
      </a>
    </p>
    <p>Si el problema persiste, contáctanos y te ayudaremos a resolverlo.</p>
  `;

  return getBaseEmailTemplate({
    title: "Pago Fallido",
    content,
    primaryColor: "#EF4444",
    accentColor: "#F87171",
  });
}

/**
 * Email de recordatorio de pago pendiente
 */
export function getPaymentReminderEmail(params: {
  userName: string;
  amount: string;
  planName: string;
  dueDate: string;
}): string {
  const content = `
    <p>Hola <strong>${params.userName}</strong>,</p>
    <div class="badge badge-warning">⏰ Recordatorio de Pago</div>
    <p>Este es un recordatorio de que tienes un pago pendiente:</p>
    <div class="info-box">
      <ul>
        <li><strong>Plan:</strong> ${params.planName}</li>
        <li><strong>Monto:</strong> ${params.amount}</li>
        <li><strong>Fecha límite:</strong> ${params.dueDate}</li>
      </ul>
    </div>
    <p>Para mantener tu suscripción activa, por favor realiza el pago antes de la fecha límite.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard" class="button">
        Realizar Pago
      </a>
    </p>
    <p>Si ya realizaste el pago, puedes ignorar este mensaje.</p>
  `;

  return getBaseEmailTemplate({
    title: "Recordatorio de Pago",
    content,
    primaryColor: "#F59E0B",
    accentColor: "#D97706",
  });
}

/**
 * Email de notificación de no-show (cliente no asistió)
 */
export function getNoShowNotificationEmail(params: {
  professionalName: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
}): string {
  const content = `
    <p>Hola <strong>${params.professionalName}</strong>,</p>
    <div class="badge badge-error">❌ Cliente No Asistió</div>
    <p>El cliente no asistió a la siguiente cita:</p>
    <div class="info-box">
      <ul>
        <li><strong>Cliente:</strong> ${params.clientName}</li>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
      </ul>
    </div>
    <p>La cita ha sido marcada como "no asistió" en tu dashboard.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard/appointments" class="button">
        Ver en Dashboard
      </a>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Cliente No Asistió",
    content,
    primaryColor: "#EF4444",
    accentColor: "#F87171",
  });
}

/**
 * Email de notificación de cita completada
 */
export function getAppointmentCompletedEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  reviewLink?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <div class="badge badge-success">✅ Cita Completada</div>
    <p>Gracias por confiar en <strong>${params.businessName}</strong>.</p>
    <p>Tu cita ha sido completada:</p>
    <div class="info-box">
      <ul>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
      </ul>
    </div>
    ${params.reviewLink
      ? `<p style="text-align: center; margin: 30px 0;">
           <a href="${params.reviewLink}" class="button">Dejar una Reseña</a>
         </p>`
      : ''
    }
    <p>Esperamos verte pronto. ¡Que tengas un excelente día!</p>
  `;

  return getBaseEmailTemplate({
    title: "Cita Completada",
    content,
  });
}

/**
 * Email de confirmación manual del profesional (cuando confirma una cita pendiente)
 */
export function getAppointmentManuallyConfirmedEmail(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  businessPhone?: string;
  businessAddress?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.clientName}</strong>,</p>
    <div class="badge badge-success">✅ Cita Confirmada</div>
    <p>¡Buenas noticias! Tu reserva ha sido confirmada por <strong>${params.businessName}</strong>:</p>
    <div class="info-box">
      <ul>
        <li><strong>Servicio:</strong> ${params.serviceName}</li>
        <li><strong>Fecha:</strong> ${params.date}</li>
        <li><strong>Hora:</strong> ${params.time}</li>
        <li><strong>Profesional:</strong> ${params.businessName}</li>
        ${params.businessPhone ? `<li><strong>Teléfono:</strong> ${params.businessPhone}</li>` : ''}
        ${params.businessAddress ? `<li><strong>Dirección:</strong> ${params.businessAddress}</li>` : ''}
      </ul>
    </div>
    <p>Recibirás recordatorios automáticos 24 horas y 2 horas antes de tu cita.</p>
    <p>¡Te esperamos!</p>
  `;

  return getBaseEmailTemplate({
    title: "¡Tu Cita ha sido Confirmada!",
    content,
  });
}

/**
 * Email de cambio de contraseña exitoso
 */
export function getPasswordChangedEmail(params: {
  userName: string;
  changeDate: string;
  ipAddress?: string;
}): string {
  const content = `
    <p>Hola <strong>${params.userName}</strong>,</p>
    <div class="badge badge-success">🔒 Contraseña Actualizada</div>
    <p>Tu contraseña ha sido cambiada exitosamente.</p>
    <div class="info-box">
      <ul>
        <li><strong>Fecha:</strong> ${params.changeDate}</li>
        ${params.ipAddress ? `<li><strong>Desde:</strong> ${params.ipAddress}</li>` : ''}
      </ul>
    </div>
    <p><strong>¿No fuiste tú?</strong></p>
    <p>Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente para asegurar tu cuenta.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="mailto:${SUPPORT_EMAIL}" class="button button-secondary">Contactar Soporte</a>
    </p>
    <p>Por seguridad, recomendamos usar una contraseña única y segura.</p>
  `;

  return getBaseEmailTemplate({
    title: "Contraseña Actualizada",
    content,
    primaryColor: "#3B82F6",
    accentColor: "#60A5FA",
  });
}

/**
 * Email de actualización de perfil
 */
export function getProfileUpdatedEmail(params: {
  userName: string;
  changes: string[];
}): string {
  const changesList = params.changes.map(change => `<li>${change}</li>`).join('');

  const content = `
    <p>Hola <strong>${params.userName}</strong>,</p>
    <div class="badge badge-info">📝 Perfil Actualizado</div>
    <p>Tu perfil ha sido actualizado exitosamente:</p>
    <div class="info-box">
      <ul>
        ${changesList}
      </ul>
    </div>
    <p>Si no realizaste estos cambios, por favor contacta a nuestro equipo de soporte.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard" class="button">
        Ver mi Perfil
      </a>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Perfil Actualizado",
    content,
    primaryColor: "#8B5CF6",
    accentColor: "#A78BFA",
  });
}

/**
 * Email de notificación de expiración de trial
 */
export function getTrialExpiredEmail(params: {
  userName: string;
  planPrice: string;
}): string {
  const content = `
    <p>Hola <strong>${params.userName}</strong>,</p>
    <div class="badge badge-warning">⏳ Periodo de Prueba Finalizado</div>
    <p>Tu periodo de prueba gratuito de 15 días ha terminado.</p>
    <p>Esperamos que hayas disfrutado de todas las funcionalidades premium de ${APP_NAME}.</p>
    <div class="info-box">
      <p>Para seguir gestionando tus citas y mantener tu agenda activa, por favor activa tu suscripción.</p>
      <p><strong>Precio del plan:</strong> ${params.planPrice}/mes</p>
    </div>
    <p>Al activar tu plan obtendrás:</p>
    <ul>
      <li>✅ Citas ilimitadas</li>
      <li>✅ Recordatorios automáticos por email</li>
      <li>✅ Estadísticas avanzadas</li>
      <li>✅ Soporte prioritario</li>
    </ul>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard" class="button">
        Activar Suscripción Ahora
      </a>
    </p>
    <p>Si tienes alguna pregunta, estamos aquí para ayudarte.</p>
  `;

  return getBaseEmailTemplate({
    title: "Tu periodo de prueba ha terminado",
    content,
    primaryColor: "#F59E0B",
    accentColor: "#D97706",
  });
}

/**
 * Email de cancelación de suscripción
 */
export function getSubscriptionCancelledEmail(params: {
  userName: string;
  endDate: string;
  planName: string;
}): string {
  const content = `
    <p>Hola <strong>${params.userName}</strong>,</p>
    <div class="badge badge-warning">⚠️ Suscripción Cancelada</div>
    <p>Tu suscripción ha sido cancelada:</p>
    <div class="info-box">
      <ul>
        <li><strong>Plan:</strong> ${params.planName}</li>
        <li><strong>Fecha de finalización:</strong> ${params.endDate}</li>
      </ul>
    </div>
    <p>Tu cuenta seguirá activa hasta la fecha de finalización. Después de esa fecha, perderás acceso a las funcionalidades premium.</p>
    <p>Si cambias de opinión, puedes reactivar tu suscripción en cualquier momento desde tu dashboard.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://microagenda.cl'}/dashboard" class="button">
        Ver mi Dashboard
      </a>
    </p>
    <p>Lamentamos verte partir. Si hay algo en lo que podamos mejorar, no dudes en contactarnos.</p>
  `;

  return getBaseEmailTemplate({
    title: "Suscripción Cancelada",
    content,
    primaryColor: "#F59E0B",
    accentColor: "#D97706",
  });
}

