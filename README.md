# MicroAgenda

Sistema de agendamiento profesional para profesionales independientes (manicuristas, barberos, masajistas, psicólogos, tatuadores, etc.) que gestionan sus citas por WhatsApp.

## Características

- **Agenda Online**: Recibe reservas 24/7 desde cualquier dispositivo
- **Confirmación Automática**: Ahorra tiempo con confirmaciones instantáneas
- **Recordatorios WhatsApp**: Reduce inasistencias con recordatorios automáticos
- **Notificaciones Email**: Mantén informados a tus clientes por correo
- **Estadísticas**: Visualiza el crecimiento de tu negocio
- **Cumplimiento Legal**: Conforme a la Ley 19.628 de Protección de Datos Personales (Chile)

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router) + TypeScript + React 19
- **UI**: TailwindCSS + shadcn/ui + Framer Motion + Lucide React
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **Emails**: Resend
- **Pagos**: MercadoPago (Chile, Sandbox)
- **Notificaciones**: WhatsApp Cloud API
- **Hosting**: Vercel

## Requisitos Previos

- Node.js 18+ y npm
- Cuenta en Supabase
- Cuenta en Resend (para emails)
- Cuenta en MercadoPago Developer (modo sandbox)
- (Opcional) WhatsApp Business API

## Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
cd microagenda.cl
npm install
```

### 2. Configurar Supabase

1. Crear un nuevo proyecto en [Supabase](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el script `supabase-schema.sql`
3. Verificar que todas las tablas se crearon correctamente
4. Copiar las credenciales:
   - URL del proyecto
   - Anon key (clave pública)

### 3. Configurar Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Resend (Email)
RESEND_API_KEY=re_tu-api-key

# MercadoPago (Sandbox)
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.vercel.app/api/mercadopago-webhook

# WhatsApp Cloud API (opcional)
WHATSAPP_ID=tu-numero-id
WHATSAPP_TOKEN=tu-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Obtener Credenciales de Servicios

#### Resend (Email)

1. Crear cuenta en [Resend](https://resend.com)
2. Verificar dominio o usar dominio de prueba
3. Crear API Key en el dashboard
4. Copiar en `RESEND_API_KEY`

#### MercadoPago (Pagos)

1. Crear cuenta en [MercadoPago Developer](https://www.mercadopago.cl/developers)
2. Ir a **Tus aplicaciones** → Crear aplicación
3. Activar modo **Sandbox** (pruebas)
4. Copiar **Access Token de prueba** en `MERCADOPAGO_ACCESS_TOKEN`
5. Configurar webhook URL cuando tengas el dominio de producción

#### WhatsApp Cloud API (Opcional)

1. Crear cuenta en [Meta for Developers](https://developers.facebook.com)
2. Crear una app de WhatsApp Business
3. Obtener el **Phone Number ID** y **Access Token**
4. Configurar en `.env.local`

> **Nota**: En desarrollo, WhatsApp usa un mock que imprime mensajes en consola

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Landing page
│   ├── register/page.tsx     # Registro
│   ├── login/page.tsx        # Login
│   ├── dashboard/page.tsx    # Panel profesional
│   ├── u/[username]/page.tsx # Agenda pública
│   ├── (legal)/
│   │   ├── privacy/page.tsx  # Política de privacidad
│   │   └── terms/page.tsx    # Términos y condiciones
│   └── api/
│       ├── mercadopago-webhook/route.ts
│       └── send-reminders/route.ts
├── components/               # Componentes UI
│   └── ui/                   # shadcn/ui components
├── hooks/                    # Custom hooks
│   ├── useAppointments.ts
│   ├── useRealtime.ts
│   └── useSubscription.ts
├── lib/                      # Utilidades y clientes
│   ├── supabaseClient.ts
│   ├── resendClient.ts
│   ├── mercadopagoClient.ts
│   ├── whatsappClient.ts
│   ├── whatsappMock.ts
│   ├── authMiddleware.ts
│   ├── utils.ts
│   └── constants.ts
├── supabase-schema.sql       # Script SQL para BD
└── README.md
```

## Deploy en Vercel

### 1. Push a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/agendaprox.git
git push -u origin main
```

### 2. Importar en Vercel

1. Ir a [Vercel](https://vercel.com)
2. Importar repositorio de GitHub
3. Configurar variables de entorno (copiar de `.env.local`)
4. Deploy

### 3. Configurar Webhook de MercadoPago

1. Una vez deployed, copiar la URL de Vercel
2. Ir a tu aplicación en MercadoPago Developer
3. Configurar webhook: `https://tu-dominio.vercel.app/api/mercadopago-webhook`
4. Actualizar `MERCADOPAGO_WEBHOOK_URL` en variables de entorno de Vercel

### 4. Configurar Dominio Personalizado (Opcional)

1. En Vercel → Settings → Domains
2. Agregar tu dominio personalizado
3. Configurar DNS según instrucciones

## Uso de la Aplicación

### Para Profesionales

1. **Registro**: Crear cuenta en `/register`
2. **Configurar servicios**: Agregar servicios que ofreces
3. **Compartir agenda**: Copiar URL pública y compartirla con clientes
4. **Gestionar citas**: Ver, confirmar o cancelar citas desde el dashboard
5. **Activar suscripción**: Pagar $6.490 CLP/mes para mantener activo

### Para Clientes

1. Acceder a URL pública del profesional: `/u/[username]`
2. Seleccionar servicio, fecha y hora
3. Completar datos de contacto
4. Confirmar reserva
5. Recibir confirmación por email/WhatsApp

## Pruebas

### Modo Desarrollo

- WhatsApp: Mensajes simulados en consola
- Emails: Verificar en logs de Resend
- Pagos: Usar tarjetas de prueba de MercadoPago

### Tarjetas de Prueba (MercadoPago Chile)

- **Visa aprobada**: 4509 9535 6623 3704
- **CVV**: 123
- **Fecha**: cualquier fecha futura

## Recordatorios Automáticos

Para enviar recordatorios automáticos diariamente:

1. Configurar [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
2. Crear `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/send-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

3. Deploy

Esto enviará recordatorios todos los días a las 10:00 AM para citas del día siguiente.

## Cumplimiento Legal (Chile)

El sistema cumple con:

- **Ley N° 19.628**: Protección de la Vida Privada
- **Futura Ley 2.0**: Preparado para nueva legislación de datos

Incluye:

- Política de Privacidad completa
- Términos y Condiciones
- Consentimiento explícito en registro
- Derecho a eliminar cuenta (ARCO)
- Avisos de uso de datos en formularios

## Soporte

Para preguntas o problemas:

- Email: soporte@microagenda.cl
- Documentación: Este README
- Issues: GitHub Issues (si aplicable)

## Licencia

Código propietario. Todos los derechos reservados.

---

Desarrollado con ❤️ para profesionales independientes chilenos.
