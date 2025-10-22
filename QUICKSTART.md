# Inicio Rápido - MicroAgenda

Guía rápida para tener MicroAgenda funcionando en 10 minutos.

## Paso 1: Instalar Dependencias (1 min)

```bash
npm install
```

## Paso 2: Configurar Supabase (3 min)

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ve a SQL Editor y ejecuta `supabase-schema.sql`
3. Ve a Settings → API y copia las credenciales
4. [Guía detallada](SUPABASE_SETUP.md)

## Paso 3: Configurar Variables de Entorno (2 min)

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales mínimas:

```env
# OBLIGATORIO - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# OPCIONAL - Para desarrollo puedes omitir estos
# RESEND_API_KEY=
# MERCADOPAGO_ACCESS_TOKEN=
# WHATSAPP_ID=
# WHATSAPP_TOKEN=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Paso 4: Ejecutar en Desarrollo (1 min)

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Paso 5: Crear Primera Cuenta (3 min)

1. Ve a `/register`
2. Crea una cuenta de prueba
3. Accede al dashboard
4. Crea un servicio
5. Comparte tu agenda pública

## ¡Listo! 🎉

Tu sistema de agendamiento está funcionando.

## Configuración Opcional

### Para Emails (Resend)

1. Crea cuenta en [resend.com](https://resend.com)
2. Obtén API key
3. Agrega `RESEND_API_KEY` a `.env.local`
4. [Guía detallada](README.md#resend-email)

### Para Pagos (MercadoPago)

1. Crea cuenta en [mercadopago.cl/developers](https://www.mercadopago.cl/developers)
2. Crea aplicación y obtén Access Token de prueba
3. Agrega `MERCADOPAGO_ACCESS_TOKEN` a `.env.local`
4. [Guía detallada](MERCADOPAGO_SETUP.md)

### Para WhatsApp

1. Opcional: Configura WhatsApp Business API
2. Por defecto usa mock (imprime en consola)
3. [Guía detallada](README.md#whatsapp-cloud-api-opcional)

## Deploy a Producción

### Vercel (Recomendado - 5 min)

```bash
# 1. Push a GitHub
git init
git add .
git commit -m "Initial commit"
git push -u origin main

# 2. Importar en Vercel
# - Ve a vercel.com
# - Importa repo
# - Agrega variables de entorno
# - Deploy
```

[Guía completa de deploy](README.md#deploy-en-vercel)

## Próximos Pasos

1. ✅ Configura servicios que ofreces
2. ✅ Personaliza tu perfil profesional
3. ✅ Comparte tu agenda con clientes
4. ✅ Configura recordatorios automáticos
5. ✅ Activa suscripción para acceso completo

## Soporte

- 📖 [README completo](README.md)
- 🗄️ [Guía Supabase](SUPABASE_SETUP.md)
- 💳 [Guía MercadoPago](MERCADOPAGO_SETUP.md)
- 📧 Email: soporte@microagenda.cl

---

¡Feliz agendamiento! 🗓️
