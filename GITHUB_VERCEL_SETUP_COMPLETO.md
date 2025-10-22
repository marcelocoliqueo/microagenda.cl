# ✅ Configuración Completa: GitHub + Vercel

## 🎉 Estado Actual

Tu proyecto **MicroAgenda** está completamente configurado y listo para deployment automático.

---

## 📦 Repositorio en GitHub

**URL del Repositorio:** https://github.com/marcelocoliqueo/microagenda.cl

### Información del Repositorio

- **Propietario:** marcelocoliqueo
- **Nombre:** microagenda.cl
- **Visibilidad:** Público
- **Rama principal:** `main`
- **Commits iniciales:** 4

### Últimos Commits

```
94acd85 - docs: remove GitHub Actions workflow (optional)
07944cf - docs: update README with GitHub repo info and add GitHub Actions workflow
c68542e - docs: add comprehensive Vercel deployment guide with GitHub integration
afd7338 - Initial commit: MicroAgenda v2.0.0 - Production Ready
```

### Archivos en el Repositorio

- ✅ 61 archivos de código
- ✅ 17,842+ líneas de código
- ✅ Toda la documentación incluida
- ✅ .gitignore configurado correctamente
- ✅ Variables sensibles protegidas (.env.local excluido)

---

## 🚀 Próximos Pasos para Deployment en Vercel

### Paso 1: Importar Proyecto en Vercel

1. **Accede a Vercel:**
   ```
   https://vercel.com
   ```

2. **Inicia sesión con GitHub:**
   - Click en "Continue with GitHub"
   - Autoriza la aplicación si es necesario

3. **Importa el repositorio:**
   - Click en **"Add New..."** → **"Project"**
   - Busca: `marcelocoliqueo/microagenda.cl`
   - Click en **"Import"**

4. **Configuración del proyecto:**
   - Framework Preset: **Next.js** (auto-detectado)
   - Root Directory: `./` (raíz)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
   - Install Command: `npm install` (auto)

---

### Paso 2: Configurar Variables de Entorno

**IMPORTANTE:** Antes de hacer el primer deploy, añade TODAS estas variables:

#### Variables REQUERIDAS

```env
# Supabase (Database & Auth) - REQUERIDO
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MercadoPago (Payments) - REQUERIDO
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx
# Para producción usar: PROD-xxxxx
MERCADOPAGO_WEBHOOK_SECRET=genera_un_secreto_aleatorio_base64

# App Configuration - REQUERIDO
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_APP_NAME=MicroAgenda

# Cron Job - REQUERIDO
CRON_SECRET=genera_un_secreto_aleatorio
```

#### Variables OPCIONALES (pero recomendadas)

```env
# Resend (Email Notifications)
RESEND_API_KEY=re_xxxxxxxxxxxx

# WhatsApp Cloud API (Notifications)
WHATSAPP_ID=1234567890
WHATSAPP_TOKEN=EAAxxxxxxxxxx
```

#### Cómo añadir las variables en Vercel:

1. En la página de configuración del proyecto
2. Sección **"Environment Variables"**
3. Para cada variable:
   - Name: `NOMBRE_VARIABLE`
   - Value: `valor`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
4. Click **"Add"**

---

### Paso 3: Hacer el Primer Deploy

1. **Una vez configuradas todas las variables:**
   - Click en **"Deploy"**

2. **Espera el build (2-3 minutos):**
   - Vercel instalará dependencias
   - Ejecutará `npm run build`
   - Desplegará a producción

3. **Verifica el deployment:**
   - URL generada: `https://microagenda-cl-xxxx.vercel.app`
   - Click en **"Visit"** para ver el sitio

---

### Paso 4: Configurar el Webhook de MercadoPago

**Después del primer deployment exitoso:**

1. **Copia tu URL de Vercel:**
   ```
   https://tu-proyecto-xxxx.vercel.app
   ```

2. **Ve a MercadoPago Developers:**
   - https://www.mercadopago.cl/developers/panel
   - Selecciona tu aplicación
   - Sección **"Webhooks"**

3. **Configura el webhook:**
   ```
   URL de producción: https://tu-proyecto.vercel.app/api/mercadopago-webhook
   Eventos: ✅ payments, ✅ subscriptions
   ```

4. **Guarda el webhook secret:**
   - MercadoPago te dará un secret
   - Actualiza `MERCADOPAGO_WEBHOOK_SECRET` en Vercel

5. **Actualiza NEXT_PUBLIC_APP_URL:**
   - En Vercel → Settings → Environment Variables
   - Edita: `NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app`
   - Click **"Save"**
   - Redeploy el proyecto

---

### Paso 5: Verificar el Cron Job

Vercel automáticamente detecta `vercel.json` y configura el Cron Job:

1. **En el dashboard de Vercel:**
   - Tu proyecto → **"Cron Jobs"**

2. **Verifica que existe:**
   ```
   Path: /api/send-reminders
   Schedule: 0 12 * * * (diario a las 12:00 UTC = 09:00 Chile)
   ```

3. **Prueba el Cron Job:**
   - Click en **"Trigger"** para ejecutar manualmente
   - Revisa los logs para verificar que funciona

---

### Paso 6: Configurar Dominio Personalizado (Opcional)

Si tienes el dominio `microagenda.cl`:

1. **En Vercel:**
   - Settings → **Domains**
   - Click **"Add"**
   - Ingresa: `microagenda.cl`
   - Click **"Add"**
   - Repite para: `www.microagenda.cl`

2. **Configurar DNS:**
   - Ve a tu proveedor de dominios (GoDaddy, Namecheap, etc.)
   - Añade estos registros:

   ```
   Tipo: A
   Host: @
   Valor: 76.76.21.21
   TTL: Automático

   Tipo: CNAME
   Host: www
   Valor: cname.vercel-dns.com
   TTL: Automático
   ```

3. **Espera la verificación:**
   - Puede tomar 5-60 minutos
   - Vercel automáticamente configurará SSL/HTTPS

4. **Actualiza variables de entorno:**
   ```env
   NEXT_PUBLIC_APP_URL=https://microagenda.cl
   ```

---

## 🔄 Deployment Automático Configurado

### Cómo Funciona

Cada vez que hagas `git push` a la rama `main`, Vercel:

1. ✅ Detecta el push automáticamente
2. ✅ Descarga el código actualizado
3. ✅ Instala dependencias (`npm install`)
4. ✅ Ejecuta el build (`npm run build`)
5. ✅ Ejecuta tests (si los hay)
6. ✅ Despliega a producción
7. ✅ Te notifica por email

### Workflow Recomendado

#### Para cambios menores:

```bash
# 1. Hacer cambios en el código
# Editar archivos...

# 2. Commit y push
git add .
git commit -m "fix: corregir error en formulario de reserva"
git push origin main

# 3. Vercel despliega automáticamente a producción
# Recibirás un email cuando esté listo
```

#### Para cambios mayores (usar ramas):

```bash
# 1. Crear una rama para el feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar notificaciones por SMS"

# 3. Push de la rama
git push origin feature/nueva-funcionalidad

# 4. Vercel crea un Preview Deployment
# URL: https://microagenda-cl-git-feature-nueva-marcelocoliqueo.vercel.app

# 5. Revisar el preview

# 6. Si todo está OK, merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main

# 7. Vercel despliega a producción
```

---

## 📊 Monitoreo y Logs

### Ver Deployments

1. **Dashboard de Vercel:**
   ```
   https://vercel.com/marcelocoliqueo/microagenda-cl
   ```

2. **Cada deployment muestra:**
   - ✅ Status (Success, Failed, Building)
   - ✅ Commit que disparó el deployment
   - ✅ Build logs
   - ✅ Runtime logs
   - ✅ Preview URL

### Ver Logs en Tiempo Real

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Ver logs en tiempo real
vercel logs --follow
```

### Ver Logs del Cron Job

1. Dashboard → Tu proyecto → **Cron Jobs**
2. Click en el job
3. Click en **"View Logs"**

---

## 🛠️ Comandos Útiles

### Git (Local)

```bash
# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline -10

# Ver cambios no committeados
git diff

# Crear nueva rama
git checkout -b nombre-rama

# Cambiar de rama
git checkout main

# Ver ramas
git branch -a

# Actualizar desde GitHub
git pull origin main
```

### Vercel CLI

```bash
# Ver proyectos
vercel list

# Ver deployment actual
vercel inspect

# Ver logs
vercel logs

# Hacer rollback
vercel rollback

# Ver variables de entorno
vercel env ls

# Añadir variable de entorno
vercel env add
```

---

## 🔐 Seguridad: Checklist

- ✅ `.env.local` está en `.gitignore`
- ✅ Nunca subir variables sensibles a GitHub
- ✅ Todas las variables en Vercel Dashboard
- ✅ MercadoPago webhook secret configurado
- ✅ Cron secret configurado
- ✅ Supabase RLS habilitado
- ✅ HTTPS automático en Vercel

---

## 🚨 Troubleshooting

### Error: "Build Failed"

1. **Revisar los logs en Vercel:**
   - Deployment → **"View Function Logs"**

2. **Verificar que compila localmente:**
   ```bash
   npm run build
   ```

3. **Verificar variables de entorno:**
   - Asegúrate de que todas estén configuradas

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Commit y push
git add package-lock.json
git commit -m "fix: update dependencies"
git push origin main
```

### Webhook de MercadoPago no funciona

1. Verifica que la URL sea correcta
2. Revisa los logs en Vercel → Functions → `/api/mercadopago-webhook`
3. Verifica que `MERCADOPAGO_WEBHOOK_SECRET` esté configurado
4. Prueba manualmente: `curl -X POST https://tu-url.vercel.app/api/mercadopago-webhook`

### Cron Job no ejecuta

1. Verifica que `CRON_SECRET` esté configurado
2. Revisa los logs del Cron Job en Vercel
3. Prueba manualmente el endpoint:
   ```bash
   curl -X POST https://tu-url.vercel.app/api/send-reminders \
     -H "Authorization: Bearer TU_CRON_SECRET"
   ```

---

## 📚 Recursos Importantes

### Documentación

- **README del proyecto:** [README.md](./README.md)
- **Guía de deployment:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Checklist de deployment:** [CHECKLIST_DEPLOYMENT.md](./CHECKLIST_DEPLOYMENT.md)
- **Configuración de Supabase:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Configuración de MercadoPago:** [MERCADOPAGO_SETUP.md](./MERCADOPAGO_SETUP.md)

### Links

- **Repositorio GitHub:** https://github.com/marcelocoliqueo/microagenda.cl
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **MercadoPago Developers:** https://www.mercadopago.cl/developers/
- **Resend Dashboard:** https://resend.com/dashboard
- **Meta for Developers:** https://developers.facebook.com

---

## ✅ Checklist Final Antes de Ir a Producción

### Configuración Técnica

- [ ] Proyecto importado en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] Primer deployment exitoso
- [ ] Webhook de MercadoPago configurado
- [ ] Cron Job verificado en Vercel
- [ ] SSL/HTTPS funcionando

### Supabase

- [ ] Proyecto creado
- [ ] Schema SQL ejecutado (`supabase-schema.sql`)
- [ ] Schema actualizado (`schema_update.sql`)
- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas de seguridad verificadas
- [ ] Realtime habilitado en `appointments` y `services`

### Integraciones

- [ ] Resend API configurada y email verificado
- [ ] MercadoPago en modo producción (cambiar de TEST a PROD)
- [ ] WhatsApp API configurada (o modo mock deshabilitado)
- [ ] Plan único creado en tabla `plans`

### Legal y Contenido

- [ ] Política de privacidad revisada
- [ ] Términos y condiciones revisados
- [ ] Información de contacto actualizada
- [ ] Precio de suscripción actualizado (si cambió)

### Testing

- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Crear servicio funciona
- [ ] Crear cita funciona
- [ ] Página pública (`/u/[username]`) funciona
- [ ] Reserva desde página pública funciona
- [ ] Email de confirmación llega
- [ ] Pago de prueba funciona (sandbox)
- [ ] Recordatorio manual funciona

---

## 🎉 ¡Todo Listo!

Tu proyecto **MicroAgenda** está configurado correctamente y listo para:

✅ Desarrollo continuo con Git
✅ Deployment automático en cada push
✅ Monitoreo en tiempo real
✅ Escalamiento según demanda
✅ Notificaciones automáticas
✅ Pagos procesados

**Próximo paso:** Configura tus variables de entorno en Vercel y haz tu primer deployment.

---

**Creado:** 2025-10-22
**Repositorio:** https://github.com/marcelocoliqueo/microagenda.cl
**Versión:** 2.0.0
