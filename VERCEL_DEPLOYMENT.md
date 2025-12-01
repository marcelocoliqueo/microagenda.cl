# Guía de Deployment en Vercel con GitHub

Tu proyecto ya está configurado en GitHub y listo para deployment automático en Vercel.

## ✅ Completado

- ✅ Repositorio Git inicializado
- ✅ Commit inicial creado (61 archivos, 17,842+ líneas)
- ✅ Repositorio creado en GitHub: https://github.com/marcelocoliqueo/microagenda.cl
- ✅ Código subido a GitHub (branch `main`)
- ✅ Configuración lista para Vercel

---

## 🚀 Paso 1: Conectar Vercel con GitHub

### Opción A: Desde la web de Vercel (Recomendado)

1. **Ve a Vercel:**
   - Accede a https://vercel.com
   - Inicia sesión con tu cuenta de GitHub

2. **Importa tu proyecto:**
   - Click en **"Add New..."** → **"Project"**
   - Selecciona **"Import Git Repository"**
   - Busca y selecciona: `marcelocoliqueo/microagenda.cl`
   - Click en **"Import"**

3. **Configuración del proyecto:**
   ```
   Framework Preset: Next.js (auto-detectado)
   Build Command: npm run build (auto)
   Output Directory: .next (auto)
   Install Command: npm install (auto)
   ```

4. **Variables de Entorno:**

   Antes de hacer el deploy, añade TODAS estas variables en **Environment Variables**:

   ⚠️ **IMPORTANTE:** Al copiar/pegar valores en Vercel, asegúrate de NO incluir saltos de línea (`\n`) ni espacios adicionales al final. Esto causa errores de conexión WebSocket/Realtime. Ver: `VERCEL_ENV_FIX.md` para más detalles.

   ```env
   # Supabase (REQUERIDO)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # MercadoPago (REQUERIDO para pagos)
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx (o PROD-xxxxx)
   MERCADOPAGO_WEBHOOK_SECRET=tu_secreto_base64

   # App Configuration (REQUERIDO)
   NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
   NEXT_PUBLIC_APP_NAME=MicroAgenda
   CRON_SECRET=genera_un_secreto_aleatorio

   # Email - Resend (OPCIONAL pero recomendado)
   RESEND_API_KEY=re_xxxxxxxxxxxx

   ```

   **IMPORTANTE:** Añade estas variables para los 3 ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Deploy:**
   - Click en **"Deploy"**
   - Espera 2-3 minutos mientras Vercel construye tu proyecto

### Opción B: Desde la terminal (CLI)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy (desde la carpeta del proyecto)
vercel

# Sigue las instrucciones:
# - Link to existing project? No
# - Project name: microagenda-cl
# - Directory: ./
# - Auto-detected Next.js
```

Luego configura las variables de entorno desde el dashboard de Vercel.

---

## 🔄 Paso 2: Configurar Deployment Automático

**¡Ya está configurado automáticamente!**

Cada vez que hagas push a GitHub, Vercel detectará los cambios y hará deployment automático:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

**Vercel automáticamente:**
1. Detecta el push a GitHub
2. Inicia un nuevo build
3. Ejecuta `npm install`
4. Ejecuta `npm run build`
5. Deploya a producción
6. Te envía una notificación (email/Discord/Slack)

---

## 📋 Paso 3: Configurar el Webhook de MercadoPago

Después del primer deployment:

1. **Copia tu URL de producción:**
   ```
   https://tu-proyecto.vercel.app
   ```

2. **Ve a MercadoPago Developers:**
   - https://www.mercadopago.cl/developers/panel
   - Sección **"Webhooks"**

3. **Configura el webhook:**
   ```
   URL: https://tu-proyecto.vercel.app/api/mercadopago-webhook
   Eventos: payments, subscriptions
   ```

4. **Actualiza la variable de entorno:**
   ```env
   NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
   ```

---

## 🔧 Paso 4: Verificar el Cron Job

Vercel automáticamente detecta el archivo `vercel.json` y configura el Cron Job:

```json
{
  "crons": [
    {
      "path": "/api/send-reminders",
      "schedule": "0 12 * * *"
    }
  ]
}
```

**Verificación:**
1. Ve al dashboard de Vercel
2. Tu proyecto → **"Cron Jobs"**
3. Verifica que aparece: `/api/send-reminders` cada día a las 12:00 UTC (09:00 Chile)

---

## 🌐 Paso 5: Configurar Dominio Personalizado (Opcional)

Si tienes el dominio `microagenda.cl`:

1. **En Vercel:**
   - Settings → **Domains**
   - Add Domain: `microagenda.cl`
   - Add Domain: `www.microagenda.cl`

2. **En tu proveedor de DNS:**
   ```
   Tipo A:     microagenda.cl → 76.76.21.21
   Tipo CNAME: www → cname.vercel-dns.com
   ```

3. **Espera la verificación SSL** (automática, ~5 minutos)

---

## 📊 Monitoreo y Logs

### Ver deployments:
- https://vercel.com/marcelocoliqueo/microagenda-cl/deployments

### Ver logs en tiempo real:
```bash
vercel logs microagenda-cl --follow
```

### Ver logs del Cron Job:
- Dashboard → Cron Jobs → Click en el job → View Logs

---

## 🔒 Seguridad: Proteger Variables de Entorno

**NUNCA subas estos archivos a GitHub:**
- ✅ `.env.local` (ya está en .gitignore)
- ✅ `.env` (ya está en .gitignore)
- ✅ `.env.production` (ya está en .gitignore)

**Solo usa variables de entorno en Vercel Dashboard**

---

## 🚨 Rollback en caso de error

Si un deployment falla o tiene bugs:

1. **Desde el Dashboard:**
   - Deployments → Click en un deployment anterior → **"Promote to Production"**

2. **Desde la terminal:**
   ```bash
   vercel rollback
   ```

---

## 📝 Workflow Recomendado

### Para desarrollo:
```bash
# 1. Crear una rama para tu feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push a GitHub
git push origin feature/nueva-funcionalidad

# 4. Vercel creará un Preview Deployment automático
# URL: https://microagenda-cl-git-feature-nueva-marc.vercel.app
```

### Para producción:
```bash
# 1. Merge a main
git checkout main
git merge feature/nueva-funcionalidad

# 2. Push a main
git push origin main

# 3. Vercel despliega automáticamente a producción
```

---

## ✅ Checklist Final

Antes de ir a producción, verifica:

- [ ] Todas las variables de entorno configuradas en Vercel
- [ ] NEXT_PUBLIC_APP_URL apunta a tu dominio de producción
- [ ] Supabase configurado con la URL correcta
- [ ] MercadoPago webhook configurado
- [ ] Cron job activo en Vercel
- [ ] RLS (Row Level Security) habilitado en Supabase
- [ ] Políticas de privacidad y términos actualizados
- [ ] Emails de Resend verificados

---

## 🆘 Troubleshooting

### Error: "Module not found"
```bash
# Asegúrate de que package.json tiene todas las dependencias
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Error: "Build failed"
- Revisa los logs en Vercel Dashboard
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que el código compila localmente: `npm run build`

### Cron Job no ejecuta:
- Verifica que CRON_SECRET esté configurado
- Revisa los logs del Cron Job en Vercel
- Verifica que el endpoint `/api/send-reminders` responde correctamente

---

## 📚 Recursos

- **Repositorio:** https://github.com/marcelocoliqueo/microagenda.cl
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **MercadoPago Developers:** https://www.mercadopago.cl/developers/
- **Resend Dashboard:** https://resend.com/dashboard

---

## 🎉 ¡Listo!

Tu proyecto está configurado para deployment continuo. Cada push a `main` se desplegará automáticamente a producción.

**Próximo paso:** Configura tus variables de entorno en Vercel y haz tu primer deployment!
