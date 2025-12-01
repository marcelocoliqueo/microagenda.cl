# MicroAgenda

[![GitHub](https://img.shields.io/badge/GitHub-marcelocoliqueo%2Fmicroagenda.cl-blue?logo=github)](https://github.com/marcelocoliqueo/microagenda.cl)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)

Sistema de agendamiento profesional para profesionales independientes (manicuristas, barberos, masajistas, psicólogos, tatuadores, etc.) con recordatorios automáticos por email.

**Estado:** ✅ Producción Ready | **Versión:** 2.0.0 | **Repositorio:** [github.com/marcelocoliqueo/microagenda.cl](https://github.com/marcelocoliqueo/microagenda.cl)

## Características

- **Agenda Online**: Recibe reservas 24/7 desde cualquier dispositivo
- **Confirmación Flexible**: Elige entre confirmación automática o manual para tener control total
- **Recordatorios por Email**: Reduce inasistencias con recordatorios automáticos por email
- **Notificaciones Email**: Mantén informados a tus clientes por correo
- **Estadísticas**: Visualiza el crecimiento de tu negocio
- **Cumplimiento Legal**: Conforme a la Ley 19.628 de Protección de Datos Personales (Chile)

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router) + TypeScript + React 19
- **UI**: TailwindCSS + shadcn/ui + Framer Motion + Lucide React
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **Emails**: Resend
- **Pagos**: MercadoPago (Chile, Sandbox)
- **Notificaciones**: Resend (Email)
- **Hosting**: Vercel

## Requisitos Previos

- Node.js 18+ y npm
- Cuenta en Supabase
- Cuenta en Resend (para emails)
- Cuenta en MercadoPago Developer (modo sandbox)

## Instalación y Configuración

### 1. Clonar el proyecto desde GitHub

```bash
git clone https://github.com/marcelocoliqueo/microagenda.cl.git
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
│   ├── authMiddleware.ts
│   ├── utils.ts
│   └── constants.ts
├── supabase-schema.sql       # Script SQL para BD
└── README.md
```

## Deploy en Vercel

> **✅ Repositorio ya configurado:** El proyecto está conectado a GitHub y listo para deployment automático.

### Deployment Automático

Cada push a la rama `main` se despliega automáticamente a producción en Vercel:

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push origin main
# Vercel detecta el push y despliega automáticamente
```

### Configuración Inicial en Vercel

1. **Ir a [Vercel](https://vercel.com)** e iniciar sesión con GitHub
2. **Importar el proyecto:**
   - Click en "Add New..." → "Project"
   - Seleccionar `marcelocoliqueo/microagenda.cl`
   - Click en "Import"

3. **Configurar variables de entorno:**
   - Añadir TODAS las variables de `.env.local.example`
   - Aplicar a: Production, Preview, Development

4. **Deploy:**
   - Click en "Deploy"
   - Esperar 2-3 minutos

5. **Configurar Webhook de MercadoPago:**
   - Copiar URL de Vercel: `https://tu-proyecto.vercel.app`
   - En MercadoPago Developer → Webhooks
   - URL: `https://tu-proyecto.vercel.app/api/mercadopago-webhook`

6. **Configurar Dominio Personalizado (Opcional):**
   - En Vercel → Settings → Domains
   - Agregar `microagenda.cl` y `www.microagenda.cl`
   - Configurar DNS según instrucciones

**📚 Guía Completa:** Ver [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) para instrucciones detalladas

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
5. Recibir confirmación por email

## Pruebas

### Modo Desarrollo

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
