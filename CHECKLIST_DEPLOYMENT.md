# ✅ Checklist de Deployment - MicroAgenda

**Fecha:** Enero 2025
**Versión:** 2.0.0
**Tiempo estimado total:** ~2 horas

---

## 📋 Pre-Requisitos

- [ ] Cuenta GitHub creada
- [ ] Cuenta Vercel creada
- [ ] Cuenta Supabase creada
- [ ] Cuenta MercadoPago Developer creada
- [ ] Node.js y npm instalados localmente
- [ ] Git instalado localmente

---

## ⏱️ PASO 1: Supabase (30 min)

### 1.1 Crear Proyecto
- [ ] Ir a [supabase.com](https://supabase.com)
- [ ] Click "New Project"
- [ ] Nombre: `microagenda-prod`
- [ ] Password: Guardar en lugar seguro
- [ ] Región: `South America (São Paulo)`
- [ ] Esperar que termine de crear (~2 min)

### 1.2 Ejecutar Schema Inicial
- [ ] Abrir SQL Editor en Supabase
- [ ] Copiar contenido de `supabase-schema.sql`
- [ ] Pegar en SQL Editor
- [ ] Click "Run"
- [ ] Verificar: "Success. No rows returned"

### 1.3 Ejecutar Schema Update
- [ ] En SQL Editor (nueva query)
- [ ] Copiar contenido de `schema_update.sql`
- [ ] Pegar en SQL Editor
- [ ] Click "Run"
- [ ] Verificar: "Success"

### 1.4 Verificar Tablas
- [ ] Ir a Table Editor
- [ ] Ver que existen:
  - `users`
  - `services`
  - `appointments`
  - `subscriptions`
  - `payment_logs`

### 1.5 Verificar Funciones
- [ ] Ir a Database → Functions
- [ ] Verificar que existen:
  - `get_peak_hours`
  - `get_recurring_clients`

### 1.6 Obtener Credenciales
- [ ] Ir a Settings → API
- [ ] Copiar `Project URL` → Guardar como `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copiar `anon public` key → Guardar como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**✅ Paso 1 completado**

---

## 💳 PASO 2: MercadoPago (20 min)

### 2.1 Crear Aplicación
- [ ] Ir a [mercadopago.cl/developers](https://www.mercadopago.cl/developers)
- [ ] Iniciar sesión o crear cuenta
- [ ] Click "Tus aplicaciones" → "Crear aplicación"
- [ ] Nombre: `MicroAgenda`
- [ ] Usar modelo de integración: `Pagos online y presenciales`

### 2.2 Obtener Credenciales de Prueba
- [ ] Ir a Credenciales de prueba
- [ ] Copiar `Access Token` → Guardar como `MERCADOPAGO_ACCESS_TOKEN`
- [ ] Anotar para más adelante: Usar credenciales PROD cuando estés listo

### 2.3 Configurar MCP
- [ ] Abrir `mcp-config.json`
- [ ] Reemplazar `<ACCESS_TOKEN>` con el Access Token copiado
- [ ] Guardar archivo

### 2.4 Generar Webhook Secret
```bash
openssl rand -base64 32
```
- [ ] Copiar resultado → Guardar como `MERCADOPAGO_WEBHOOK_SECRET`

**✅ Paso 2 completado**

---

## 📧 PASO 3: Resend (10 min - Opcional)

### Si quieres emails:
- [ ] Ir a [resend.com](https://resend.com)
- [ ] Crear cuenta
- [ ] Click "API Keys" → "Create API Key"
- [ ] Nombre: `MicroAgenda Production`
- [ ] Copiar key → Guardar como `RESEND_API_KEY`

### Si NO quieres emails ahora:
- [ ] Saltear este paso
- [ ] Los emails no se enviarán pero la app funcionará igual

**✅ Paso 3 completado (o salteado)**

---

## 📝 PASO 4: Preparar Variables (5 min)

### 4.1 Crear archivo temporal
- [ ] Crear un archivo de texto: `mis-variables.txt`
- [ ] Copiar esta plantilla y completar con tus valores:

```env
# SUPABASE (del Paso 1.6)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# MERCADOPAGO (del Paso 2.2 y 2.4)
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret-generado

# RESEND (del Paso 3 - opcional)
RESEND_API_KEY=re_tu-api-key

# APP CONFIG
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_APP_NAME=MicroAgenda

# CRON SECRET (generar nuevo)
CRON_SECRET=genera-uno-nuevo-abajo
```

### 4.2 Generar CRON_SECRET
```bash
openssl rand -base64 32
```
- [ ] Copiar resultado → Pegar en `CRON_SECRET`

### 4.3 Verificar
- [ ] Todas las variables completadas (excepto opcionales)
- [ ] No hay espacios antes/después de valores
- [ ] Archivo guardado en lugar seguro

**✅ Paso 4 completado**

---

## 🔧 PASO 5: Git y GitHub (15 min)

### 5.1 Verificar directorio
```bash
pwd
# Debe mostrar: /Users/ignacio/Documents/microagenda.cl
```
- [ ] Estás en el directorio correcto

### 5.2 Inicializar Git (si no existe)
```bash
git init
```
- [ ] Ejecutado

### 5.3 Verificar .gitignore
```bash
cat .gitignore
```
- [ ] Contiene `.env.local`
- [ ] Contiene `node_modules`
- [ ] Contiene `.next`

### 5.4 Agregar archivos
```bash
git add .
```
- [ ] Ejecutado

### 5.5 Crear commit
```bash
git commit -m "feat: MicroAgenda v2.0.0 - Rebranding completo

- Cambio de nombre AgendaProX → MicroAgenda
- Nueva identidad visual (colores, tipografía)
- Funciones analíticas BD (peak hours, recurring clients)
- Cron job configurado para hora Chile (09:00)
- MercadoPago MCP configurado
- Documentación completa actualizada
- Legal compliance actualizado
- Ready for production deployment"
```
- [ ] Commit creado exitosamente

### 5.6 Crear repositorio en GitHub
- [ ] Ir a [github.com](https://github.com)
- [ ] Click "New repository"
- [ ] Nombre: `microagenda`
- [ ] Descripción: `Sistema de agendamiento para profesionales - MicroAgenda v2.0`
- [ ] Privacidad: Private (recomendado)
- [ ] **NO** marcar "Initialize with README"
- [ ] Click "Create repository"

### 5.7 Conectar y subir
```bash
git remote add origin https://github.com/TU-USUARIO/microagenda.git
git branch -M main
git push -u origin main
```
- [ ] Reemplazar `TU-USUARIO` con tu usuario de GitHub
- [ ] Ejecutado exitosamente
- [ ] Código visible en GitHub

**✅ Paso 5 completado**

---

## ☁️ PASO 6: Vercel Deployment (20 min)

### 6.1 Importar Proyecto
- [ ] Ir a [vercel.com](https://vercel.com)
- [ ] Click "Add New..." → "Project"
- [ ] Buscar repositorio `microagenda`
- [ ] Click "Import"

### 6.2 Configurar Proyecto
- [ ] Framework Preset: `Next.js` (detectado automático)
- [ ] Root Directory: `./` (default)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] **NO hacer deploy todavía**

### 6.3 Agregar Variables de Entorno
- [ ] Click "Environment Variables"
- [ ] Abrir tu archivo `mis-variables.txt`
- [ ] Para cada variable:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `MERCADOPAGO_ACCESS_TOKEN`
  - [ ] `MERCADOPAGO_WEBHOOK_SECRET`
  - [ ] `RESEND_API_KEY` (si tienes)
  - [ ] `NEXT_PUBLIC_APP_NAME`
  - [ ] `CRON_SECRET`
- [ ] Seleccionar: Production, Preview, Development (los 3)

### 6.4 Deploy
- [ ] Click "Deploy"
- [ ] Esperar build (~2-3 min)
- [ ] Ver "Congratulations!"

### 6.5 Obtener URL
- [ ] Copiar URL del proyecto (ej: `microagenda-abc123.vercel.app`)
- [ ] Guardar como `NEXT_PUBLIC_APP_URL`

### 6.6 Actualizar APP_URL en Variables
- [ ] Ir a Settings → Environment Variables
- [ ] Editar `NEXT_PUBLIC_APP_URL`
- [ ] Pegar la URL real de Vercel
- [ ] Guardar
- [ ] Redeploy: Deployments → Latest → "..." → "Redeploy"

**✅ Paso 6 completado**

---

## 🔗 PASO 7: Configurar Webhook MercadoPago (10 min)

### 7.1 En MercadoPago Developer
- [ ] Ir a [mercadopago.cl/developers](https://www.mercadopago.cl/developers)
- [ ] Tu aplicación `MicroAgenda` → Webhooks
- [ ] Click "Configurar notificaciones"

### 7.2 Configurar URL
- [ ] URL de producción: `https://TU-PROYECTO.vercel.app/api/mercadopago-webhook`
- [ ] Reemplazar `TU-PROYECTO` con tu URL real
- [ ] Eventos: Marcar ✅ `payment`
- [ ] Guardar

### 7.3 Probar Webhook
- [ ] En Vercel → Logs (pestaña Functions)
- [ ] Hacer un pago de prueba
- [ ] Ver que aparece log: `✅ Webhook MercadoPago recibido`

**✅ Paso 7 completado**

---

## ⏰ PASO 8: Verificar Cron Job (5 min)

### 8.1 En Vercel Dashboard
- [ ] Ir a Settings → Cron Jobs
- [ ] Verificar que existe:
  - Path: `/api/send-reminders`
  - Schedule: `0 12 * * *`
  - Descripción: Diario 12:00 UTC (09:00 Chile)

### 8.2 Probar Manualmente
```bash
curl -X POST https://TU-PROYECTO.vercel.app/api/send-reminders \
  -H "Authorization: Bearer TU_CRON_SECRET"
```
- [ ] Reemplazar valores
- [ ] Ejecutar
- [ ] Ver respuesta: `{"success":true}`

**✅ Paso 8 completado**

---

## 🧪 PASO 9: Testing Completo (20 min)

### 9.1 Visitar App
- [ ] Abrir `https://TU-PROYECTO.vercel.app`
- [ ] Landing page carga correctamente
- [ ] Colores nuevos aplicados
- [ ] No hay errores en consola

### 9.2 Flujo Registro
- [ ] Click "Registrarse"
- [ ] Ingresar email de prueba: `test@test.com`
- [ ] Password: `Test123456`
- [ ] Click "Crear cuenta"
- [ ] Recibes email de confirmación (si Resend configurado)
- [ ] Confirmar email o verificar en Supabase

### 9.3 Flujo Dashboard
- [ ] Login exitoso
- [ ] Ver dashboard vacío
- [ ] Click "Crear servicio"
- [ ] Nombre: `Corte de Pelo`
- [ ] Duración: `30 min`
- [ ] Precio: `10000`
- [ ] Guardar
- [ ] Ver servicio creado

### 9.4 Flujo Agenda Pública
- [ ] Copiar tu slug: `/u/test`
- [ ] Abrir en nueva pestaña
- [ ] Ver calendario
- [ ] Seleccionar fecha futura
- [ ] Seleccionar hora disponible
- [ ] Llenar formulario cliente:
  - Nombre: `Cliente Prueba`
  - Teléfono: `+56912345678`
  - Email: `cliente@test.com`
- [ ] Click "Reservar"
- [ ] Ver confirmación

### 9.5 Verificar en Dashboard
- [ ] Volver al dashboard
- [ ] Ver cita nueva en "Próximas citas"
- [ ] Estado: Pendiente
- [ ] Click "Confirmar"
- [ ] Ver estado: Confirmada

### 9.6 Probar Pago (Sandbox)
- [ ] En agenda pública, crear otra cita
- [ ] Seleccionar "Pagar ahora"
- [ ] Usar tarjeta de prueba:
  - Número: `5031 7557 3453 0604`
  - Vencimiento: `11/25`
  - CVV: `123`
  - Nombre: `APRO`
- [ ] Completar pago
- [ ] Verificar en Logs de Vercel que webhook llegó
- [ ] Ver en dashboard que cita está "Confirmada"

### 9.7 Mobile Testing
- [ ] Abrir en móvil o DevTools → Device Mode
- [ ] Navegar app completa
- [ ] Verificar responsive design

**✅ Paso 9 completado**

---

## 🌐 PASO 10: Dominio Custom (Opcional - 30 min)

### 10.1 Registrar Dominio
- [ ] Comprar `microagenda.cl` en NIC Chile o proveedor
- [ ] Esperar confirmación de compra

### 10.2 Configurar en Vercel
- [ ] Vercel Dashboard → Settings → Domains
- [ ] Click "Add Domain"
- [ ] Ingresar: `microagenda.cl`
- [ ] Click "Add"
- [ ] Copiar valores DNS mostrados

### 10.3 Configurar DNS
En tu proveedor de dominio:
- [ ] Agregar record tipo `A`:
  - Name: `@`
  - Value: `76.76.21.21`
- [ ] Agregar record tipo `CNAME`:
  - Name: `www`
  - Value: `cname.vercel-dns.com`

### 10.4 Verificar
```bash
dig microagenda.cl
dig www.microagenda.cl
```
- [ ] Esperar propagación (5 min - 48h)
- [ ] Ver que apuntan a Vercel
- [ ] Visitar `https://microagenda.cl`
- [ ] SSL activo automáticamente

### 10.5 Actualizar Variables
- [ ] Vercel → Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL` → `https://microagenda.cl`
- [ ] Redeploy

### 10.6 Actualizar Webhook
- [ ] MercadoPago → Webhooks
- [ ] Cambiar URL a: `https://microagenda.cl/api/mercadopago-webhook`

**✅ Paso 10 completado**

---

## 🎉 DEPLOYMENT COMPLETADO

### ✅ Checklist Final

- [ ] Supabase funcionando
- [ ] MercadoPago conectado
- [ ] Emails enviándose (o salteado)
- [ ] Código en GitHub
- [ ] App deployada en Vercel
- [ ] Webhook configurado
- [ ] Cron job activo
- [ ] Testing completo exitoso
- [ ] Dominio custom (opcional)

---

## 📞 Soporte

**Si algo falla:**

1. **Build errors en Vercel**
   - Ver logs detallados en Deployment → Build Logs
   - Verificar que todas las variables están configuradas
   - Verificar que no hay errores de TypeScript

2. **Database errors**
   - Verificar credenciales Supabase
   - Verificar que schema fue ejecutado
   - Ver logs en Supabase → Logs

3. **Webhook no funciona**
   - Verificar URL en MercadoPago
   - Ver logs en Vercel → Functions
   - Probar manualmente con curl

4. **Cron no ejecuta**
   - Esperar hasta las 09:00 Chile
   - Ver logs en Vercel → Functions
   - Probar manualmente endpoint

**Recursos:**
- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Supabase](https://supabase.com/docs)
- [Documentación MercadoPago](https://www.mercadopago.cl/developers)

---

**Generado:** Enero 2025
**Versión:** 2.0.0
**Tiempo total estimado:** ~2 horas

> "Tu agenda simple, cercana y profesional" 🪶
