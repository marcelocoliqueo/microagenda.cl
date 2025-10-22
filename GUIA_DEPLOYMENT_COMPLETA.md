# 🚀 Guía Completa de Deployment - MicroAgenda

**Versión**: 2.0.0
**Fecha**: Enero 2025
**Tiempo estimado total**: 2-3 horas

Esta guía te llevará paso a paso desde cero hasta tener MicroAgenda funcionando en producción.

---

## 📋 CHECKLIST GENERAL

Antes de empezar, asegúrate de tener:
- [x] Código de MicroAgenda listo
- [ ] Cuenta en GitHub (gratis)
- [ ] Cuenta en Vercel (gratis)
- [ ] Cuenta en Supabase (gratis)
- [ ] Cuenta en MercadoPago Developer (gratis)
- [ ] Cuenta en Resend (opcional, gratis)
- [ ] Dominio microagenda.cl (opcional, ~$15 USD/año)

---

## PASO 1: CONFIGURAR SUPABASE (30 minutos)

### 1.1 Crear Proyecto en Supabase

```bash
# 1. Ve a https://supabase.com
# 2. Click en "Start your project" o "New Project"
# 3. Completa:
   - Name: MicroAgenda
   - Database Password: [Genera una segura y GUÁRDALA]
   - Region: South America (São Paulo) - más cercana a Chile
   - Pricing Plan: Free
# 4. Click "Create new project"
# 5. Espera 2-3 minutos mientras se crea
```

### 1.2 Ejecutar Script SQL Inicial

```bash
# 1. En Supabase, ve a SQL Editor (icono </> en sidebar)
# 2. Click en "New query"
# 3. Copia TODO el contenido de tu archivo:
cat supabase-schema.sql

# 4. Pega en el editor de Supabase
# 5. Click en "RUN" (o Ctrl/Cmd + Enter)
# 6. Deberías ver: "Success. No rows returned"
```

### 1.3 Ejecutar Actualizaciones MVP Final

```bash
# 1. En SQL Editor, click "New query" otra vez
# 2. Copia TODO el contenido de:
cat schema_update.sql

# 3. Pega en el editor
# 4. Click "RUN"
# 5. Verifica que dice "Success"
```

### 1.4 Verificar Tablas Creadas

```bash
# 1. Ve a "Table Editor" en Supabase
# 2. Deberías ver estas tablas:
   ✅ profiles
   ✅ plans
   ✅ subscriptions
   ✅ services
   ✅ appointments
   ✅ payments
```

### 1.5 Verificar Funciones Analíticas

```sql
-- En SQL Editor, ejecuta esto para verificar:
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_peak_hours', 'get_recurring_clients');

-- Deberías ver 2 filas
```

### 1.6 Obtener Credenciales

```bash
# 1. Ve a Settings → API en Supabase
# 2. Copia y GUARDA estos valores:

Project URL: https://[tu-proyecto].supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Pégalos temporalmente en un archivo .txt seguro
```

**✅ SUPABASE LISTO** - Pasa al siguiente paso

---

## PASO 2: CONFIGURAR MERCADOPAGO (20 minutos)

### 2.1 Crear Cuenta Developer

```bash
# 1. Ve a https://www.mercadopago.cl/developers
# 2. Inicia sesión con tu cuenta MercadoPago
   (Si no tienes, créala primero en mercadopago.cl)
# 3. Ve a "Tus aplicaciones"
```

### 2.2 Crear Aplicación

```bash
# 1. Click "Crear aplicación"
# 2. Completa:
   - Nombre: MicroAgenda
   - ¿Qué hará?: Procesar pagos online
   - Modelo: Checkout Pro
# 3. Click "Crear aplicación"
```

### 2.3 Obtener Credenciales de Prueba

```bash
# 1. En tu aplicación, ve a "Credenciales"
# 2. Asegúrate de estar en modo PRUEBA (toggle superior)
# 3. Copia el "Access Token de prueba"

   Ejemplo:
   TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789

# 4. GUÁRDALO en tu archivo .txt
```

### 2.4 Configurar MCP Server (Nuevo)

```bash
# Ya creamos el archivo mcp-config.json
# Edítalo y reemplaza <ACCESS_TOKEN> con tu token:

{
  "mcpServers": {
    "mercadopago-mcp-server-prod": {
      "url": "https://mcp.mercadopago.com/mcp",
      "headers": {
        "Authorization": "Bearer TEST-tu-token-aqui"
      }
    }
  }
}
```

### 2.5 Generar Webhook Secret

```bash
# En tu terminal, ejecuta:
openssl rand -base64 32

# Ejemplo de salida:
# Xk9mP2vL8qR4tY6wE1nZ3cV5bN7hJ0aS9dF4gK8iO2uT

# GUÁRDALO en tu .txt como: MERCADOPAGO_WEBHOOK_SECRET
```

**⚠️ IMPORTANTE**: Configuraremos el webhook URL después de deploy en Vercel

**✅ MERCADOPAGO LISTO** - Pasa al siguiente paso

---

## PASO 3: CONFIGURAR RESEND (Opcional, 10 minutos)

### 3.1 Crear Cuenta

```bash
# 1. Ve a https://resend.com
# 2. Click "Sign up"
# 3. Crea cuenta con tu email
```

### 3.2 Obtener API Key

```bash
# 1. Ve a "API Keys"
# 2. Click "Create API Key"
# 3. Nombre: MicroAgenda
# 4. Permission: Full access
# 5. Click "Add"
# 6. COPIA la key (empieza con "re_")

   Ejemplo: re_123abc456def789ghi

# 7. GUÁRDALA en tu .txt
```

**Nota**: Si saltas este paso, los emails no se enviarán pero la app funcionará.

**✅ RESEND CONFIGURADO** - Pasa al siguiente paso

---

## PASO 4: PREPARAR VARIABLES DE ENTORNO (5 minutos)

### 4.1 Generar CRON_SECRET

```bash
openssl rand -base64 32

# Guarda el resultado
```

### 4.2 Completar .env.local

Abre el archivo `.env.local` y completa con tus datos:

```bash
# Editar el archivo
nano .env.local

# O abrirlo con tu editor favorito
```

Reemplaza los valores:

```env
# SUPABASE (Del Paso 1.6)
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...

# RESEND (Del Paso 3.2, opcional)
RESEND_API_KEY=re_123abc...

# MERCADOPAGO (Del Paso 2.3)
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890...
MERCADOPAGO_WEBHOOK_SECRET=[el que generaste en 2.5]
MERCADOPAGO_WEBHOOK_URL=https://PENDIENTE.vercel.app/api/mercadopago-webhook

# WHATSAPP (Opcional, déjalo así por ahora)
WHATSAPP_ID=
WHATSAPP_TOKEN=

# APP CONFIG
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MicroAgenda

# CRON JOB SECRET (Del Paso 4.1)
CRON_SECRET=[el que acabas de generar]
```

### 4.3 Probar Localmente

```bash
# Instalar dependencias (si no lo hiciste)
npm install

# Probar que compila
npm run build

# Si todo está bien, debería compilar sin errores

# Probar localmente
npm run dev

# Abre http://localhost:3000
# Regístrate y prueba crear un servicio
```

**✅ VARIABLES CONFIGURADAS** - Pasa al siguiente paso

---

## PASO 5: SUBIR A GITHUB (15 minutos)

### 5.1 Inicializar Git

```bash
# En tu carpeta del proyecto
cd /Users/ignacio/Documents/microagenda.cl

# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "feat: MicroAgenda v2.0.0 - Proyecto completo

- Rebranding completo de AgendaProX a MicroAgenda
- Nueva identidad visual y paleta de colores
- Funciones analíticas en BD (peak hours, recurring clients)
- Cron job configurado para hora Chile
- Sistema de pagos con MercadoPago
- Emails con Resend
- Documentación completa
- Cumplimiento Ley 19.628 Chile
- Listo para producción"
```

### 5.2 Crear Repositorio en GitHub

```bash
# 1. Ve a https://github.com
# 2. Click en el "+" arriba a la derecha
# 3. Click "New repository"
# 4. Completa:
   - Repository name: microagenda
   - Description: Sistema de agendamiento profesional para Chile
   - Visibility: Private (recomendado) o Public
   - ❌ NO marques "Initialize with README" (ya lo tienes)
# 5. Click "Create repository"
```

### 5.3 Conectar y Subir

```bash
# Copia estos comandos de GitHub y ejecútalos:
git remote add origin https://github.com/TU-USUARIO/microagenda.git
git branch -M main
git push -u origin main

# Ingresa tus credenciales de GitHub cuando te las pida

# Deberías ver:
# Enumerating objects...
# Writing objects: 100%
# ✅ Branch 'main' set up to track remote branch 'main'
```

### 5.4 Verificar Subida

```bash
# Recarga la página de GitHub
# Deberías ver todos tus archivos

# Verifica que NO se subió .env.local (debe estar en .gitignore)
```

**✅ CÓDIGO EN GITHUB** - Pasa al siguiente paso

---

## PASO 6: DEPLOY EN VERCEL (20 minutos)

### 6.1 Crear Cuenta en Vercel

```bash
# 1. Ve a https://vercel.com
# 2. Click "Sign Up"
# 3. Selecciona "Continue with GitHub"
# 4. Autoriza Vercel en GitHub
```

### 6.2 Importar Proyecto

```bash
# 1. En Vercel Dashboard, click "Add New..."
# 2. Click "Project"
# 3. Debería aparecer tu repo "microagenda"
# 4. Click "Import"
```

### 6.3 Configurar Proyecto

```bash
# En la pantalla de configuración:

# Framework Preset: Next.js (detectado automáticamente)
# Root Directory: ./
# Build Command: next build (automático)
# Output Directory: .next (automático)

# ❌ NO HAGAS DEPLOY TODAVÍA
# Primero configuramos las variables de entorno
```

### 6.4 Agregar Variables de Entorno

```bash
# 1. Scroll hasta "Environment Variables"
# 2. Agrega TODAS estas variables (copia de tu .env.local):

# Click "Add" para cada una:

NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_...
MERCADOPAGO_ACCESS_TOKEN=TEST-...
MERCADOPAGO_WEBHOOK_SECRET=Xk9mP...
MERCADOPAGO_WEBHOOK_URL=[PENDIENTE - lo configuramos después]
WHATSAPP_ID=[vacío por ahora]
WHATSAPP_TOKEN=[vacío por ahora]
NEXT_PUBLIC_APP_URL=[PENDIENTE - lo configuramos después]
NEXT_PUBLIC_APP_NAME=MicroAgenda
CRON_SECRET=[tu secret]

# Para WHATSAPP déjalos vacíos si no los tienes
```

### 6.5 Deploy Inicial

```bash
# 1. Click "Deploy"
# 2. Espera 2-3 minutos mientras hace el build
# 3. Deberías ver: "🎉 Congratulations!"
```

### 6.6 Obtener URL de Vercel

```bash
# Vercel te dará una URL como:
# https://microagenda-abc123.vercel.app

# CÓPIALA y guárdala
```

### 6.7 Actualizar Variables con URL Real

```bash
# 1. Ve a Settings → Environment Variables
# 2. Edita estas variables:

NEXT_PUBLIC_APP_URL=https://microagenda-abc123.vercel.app
MERCADOPAGO_WEBHOOK_URL=https://microagenda-abc123.vercel.app/api/mercadopago-webhook

# 3. Click "Save"
```

### 6.8 Redeploy

```bash
# 1. Ve a Deployments
# 2. Click en los tres puntos del último deployment
# 3. Click "Redeploy"
# 4. Espera que termine
```

**✅ DEPLOY EN VERCEL COMPLETO** - Pasa al siguiente paso

---

## PASO 7: CONFIGURAR WEBHOOK MERCADOPAGO (5 minutos)

### 7.1 Actualizar Webhook URL

```bash
# 1. Ve a https://www.mercadopago.cl/developers
# 2. Tu Aplicación → Webhooks
# 3. Click "Configurar notificaciones"
# 4. URL de producción:
   https://microagenda-abc123.vercel.app/api/mercadopago-webhook

# 5. Eventos:
   ✅ Pagos
   ✅ Suscripciones (si está disponible)

# 6. Click "Guardar"
```

### 7.2 Verificar Webhook

```bash
# 1. Ve a Vercel → Logs
# 2. Mantén la pestaña abierta
# 3. En MercadoPago, haz clic en "Probar webhook"
# 4. Deberías ver logs en Vercel que digan:
   "MercadoPago Webhook received"
```

**✅ WEBHOOK CONFIGURADO** - Pasa al siguiente paso

---

## PASO 8: VERIFICAR CRON JOB (5 minutos)

### 8.1 Verificar en Vercel

```bash
# 1. En Vercel, ve a Cron Jobs
# 2. Deberías ver:
   Path: /api/send-reminders
   Schedule: 0 12 * * * (09:00 AM Chile)
   Status: Active

# Si no aparece, verifica que vercel.json esté en el repo
```

### 8.2 Probar Manualmente (Opcional)

```bash
# Desde tu terminal:
curl -X POST https://microagenda-abc123.vercel.app/api/send-reminders \
  -H "Authorization: Bearer TU_CRON_SECRET"

# Deberías recibir una respuesta JSON
```

**✅ CRON JOB FUNCIONANDO** - Pasa al siguiente paso

---

## PASO 9: TESTING COMPLETO (30 minutos)

### 9.1 Flujo de Registro y Login

```bash
# 1. Abre https://microagenda-abc123.vercel.app
# 2. Click "Comenzar Gratis" o "Registrarse"
# 3. Completa el formulario:
   - Nombre: Tu Nombre
   - Email: tu@email.com
   - Contraseña: test123456
   - Nombre negocio: Mi Salón
   - WhatsApp: +56912345678
   - ✅ Acepto términos
# 4. Click "Crear cuenta"
# 5. Deberías ser redirigido al dashboard
```

### 9.2 Crear Servicios

```bash
# 1. En el dashboard, busca "Nuevo Servicio"
# 2. Crea 2-3 servicios:

   Servicio 1:
   - Nombre: Corte de cabello
   - Duración: 30 minutos
   - Precio: 15000

   Servicio 2:
   - Nombre: Tinte completo
   - Duración: 120 minutos
   - Precio: 45000

# 3. Click "Crear Servicio" para cada uno
```

### 9.3 Probar Agenda Pública

```bash
# 1. Copia tu URL pública (está en el dashboard)
   Ejemplo: https://microagenda-abc123.vercel.app/u/tuusuario

# 2. Abre esa URL en una ventana privada/incógnito
# 3. Deberías ver tu agenda pública
# 4. Completa el formulario de reserva:
   - Nombre: Cliente Prueba
   - WhatsApp: +56987654321
   - Servicio: Corte de cabello
   - Fecha: Mañana
   - Hora: 10:00
# 5. Click "Confirmar Reserva"
# 6. Deberías ver "¡Reserva Exitosa!"
```

### 9.4 Verificar en Dashboard

```bash
# 1. Vuelve a tu dashboard
# 2. Deberías ver la nueva cita
# 3. Prueba cambiar el estado:
   - Pendiente → Confirmada
# 4. Debería actualizarse inmediatamente
```

### 9.5 Probar Pago (Sandbox)

```bash
# 1. Click "Activar Suscripción" en el dashboard
# 2. Deberías ser redirigido a MercadoPago
# 3. Usa una tarjeta de prueba:

   Número: 4509 9535 6623 3704
   Vencimiento: 12/25
   CVV: 123
   Nombre: APRO (importante)
   DNI/RUT: 12345678-9

# 4. Click "Pagar"
# 5. Deberías volver al dashboard
# 6. El estado debería cambiar a "Activa"

# Si no funciona, verifica los logs en Vercel
```

### 9.6 Verificar en Mobile

```bash
# 1. Abre la URL en tu teléfono
# 2. Verifica que todo se vea bien
# 3. Prueba hacer una reserva desde mobile
```

**✅ TESTING COMPLETADO** - ¡Todo funcionando!

---

## PASO 10: CONFIGURAR DOMINIO (Opcional, 30 minutos)

### 10.1 Registrar Dominio

```bash
# Opciones populares en Chile:
# - NIC Chile: https://www.nic.cl
# - GoDaddy Chile
# - Namecheap
# - Google Domains

# Registra: microagenda.cl (~$15 USD/año)
```

### 10.2 Configurar en Vercel

```bash
# 1. En Vercel → Settings → Domains
# 2. Click "Add"
# 3. Ingresa: microagenda.cl
# 4. Click "Add"
# 5. Vercel te mostrará los DNS records a configurar
```

### 10.3 Configurar DNS

```bash
# En tu proveedor de dominio, agrega estos records:

Type    Name    Value
────────────────────────────────────────
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com

# Guarda los cambios
```

### 10.4 Esperar Propagación

```bash
# Puede tomar de 5 minutos a 48 horas
# Usualmente: 10-30 minutos

# Verificar:
dig microagenda.cl

# Cuando esté listo, Vercel mostrará:
# ✅ Valid Configuration
```

### 10.5 Actualizar Variables

```bash
# En Vercel → Settings → Environment Variables
# Edita:

NEXT_PUBLIC_APP_URL=https://microagenda.cl
MERCADOPAGO_WEBHOOK_URL=https://microagenda.cl/api/mercadopago-webhook

# Redeploy el proyecto
```

### 10.6 Actualizar Webhook MercadoPago

```bash
# En MercadoPago → Webhooks
# Actualiza URL a:
https://microagenda.cl/api/mercadopago-webhook
```

**✅ DOMINIO CONFIGURADO** - ¡Producción lista!

---

## 📊 RESUMEN DE LO QUE TIENES AHORA

```
✅ Supabase configurado con:
   - 6 tablas creadas
   - 2 funciones analíticas
   - Row Level Security activo
   - Plan inicial insertado

✅ MercadoPago configurado con:
   - Aplicación creada
   - Modo sandbox activo
   - Webhook funcionando
   - MCP Server configurado

✅ Vercel deployment con:
   - Build exitoso
   - Variables de entorno configuradas
   - Cron job activo (09:00 AM Chile)
   - SSL activo

✅ GitHub:
   - Código versionado
   - Auto-deploy en push

✅ Aplicación funcionando:
   - Registro y login
   - Dashboard completo
   - Agenda pública
   - Pagos (sandbox)
   - Emails (si configuraste Resend)
```

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Inmediato

1. **Crear Assets Visuales**
   - Logo icon.png (512x512)
   - Logo completo logo.svg
   - OG image og.png (1200x630)
   - Favicon favicon.ico

2. **Testing Exhaustivo**
   - Probar todos los flujos múltiples veces
   - Verificar en diferentes navegadores
   - Probar en móvil

3. **Monitoreo**
   - Configurar alertas en Vercel
   - Revisar logs diariamente
   - Monitorear uso de Supabase

### Corto Plazo (1-2 semanas)

4. **Modo Producción MercadoPago**
   - Cuando tengas clientes reales
   - Cambiar a credenciales de producción
   - Probar con pago real pequeño

5. **Marketing Inicial**
   - Optimizar SEO
   - Crear contenido
   - Conseguir primeros usuarios beta

6. **Feedback**
   - Recolectar feedback de usuarios
   - Iterar y mejorar
   - Añadir features según necesidad

---

## 🆘 TROUBLESHOOTING

### Build falla en Vercel

```bash
# Ver logs detallados
# Usualmente es por:
# - Falta una variable de entorno
# - Error de TypeScript
# - Dependencia faltante

# Solución:
# 1. Ver logs completos en Vercel
# 2. Corregir localmente
# 3. Push a GitHub
# 4. Vercel hace auto-redeploy
```

### Supabase no conecta

```bash
# Verificar:
# 1. URL correcta (debe terminar en .supabase.co)
# 2. Anon key completa (muy larga)
# 3. Proyecto de Supabase activo (no pausado)

# Si usas plan Free, Supabase pausa proyectos inactivos
```

### MercadoPago webhook no funciona

```bash
# Verificar:
# 1. URL correcta en MercadoPago
# 2. HTTPS activo (Vercel lo hace automático)
# 3. Ver logs en Vercel cuando haces un pago

# Probar manualmente:
curl -X POST https://tu-url.vercel.app/api/mercadopago-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

### Emails no se envían

```bash
# Si no configuraste Resend:
# - Los emails se simulan en consola
# - No es un error

# Si configuraste Resend:
# - Verifica API key
# - Verifica dominio verificado
# - Ver logs en Resend dashboard
```

---

## 📞 RECURSOS Y AYUDA

### Documentación
- [README.md](README.md) - Documentación principal
- [BRANDING_GUIDE.md](BRANDING_GUIDE.md) - Identidad visual
- [CHANGELOG_MVP_FINAL.md](CHANGELOG_MVP_FINAL.md) - Cambios v2.0.0

### Soporte Oficial
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- MercadoPago: https://www.mercadopago.cl/developers/es/docs
- Resend: https://resend.com/docs

### Comunidades
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://nextjs.org/discord

---

## ✅ CHECKLIST FINAL

**Infraestructura**
- [ ] Supabase proyecto creado
- [ ] Schema SQL ejecutado
- [ ] Schema update ejecutado
- [ ] Funciones verificadas

**MercadoPago**
- [ ] Aplicación creada
- [ ] Credenciales obtenidas
- [ ] MCP configurado
- [ ] Webhook configurado

**Deployment**
- [ ] Código en GitHub
- [ ] Variables en Vercel
- [ ] Deploy exitoso
- [ ] Cron job activo

**Testing**
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Crear servicio funciona
- [ ] Agenda pública funciona
- [ ] Reserva funciona
- [ ] Dashboard muestra datos
- [ ] Pago sandbox funciona
- [ ] Mobile responsive OK

**Producción (Opcional)**
- [ ] Dominio configurado
- [ ] DNS propagado
- [ ] SSL activo
- [ ] MercadoPago producción

---

## 🎉 ¡FELICITACIONES!

Si completaste todos los pasos, ahora tienes:

✅ **MicroAgenda funcionando en producción**
✅ **Base de datos robusta y escalable**
✅ **Sistema de pagos integrado**
✅ **Deployment automático**
✅ **Monitoreo y logs**

**¡Tu MicroSaaS está vivo!** 🚀

Ahora es momento de:
1. Conseguir tus primeros usuarios
2. Recolectar feedback
3. Iterar y mejorar
4. ¡Hacer crecer tu negocio!

---

> **"Tu agenda simple, cercana y profesional"** 🪶
>
> **MicroAgenda** - Hecho con ❤️ en Chile
