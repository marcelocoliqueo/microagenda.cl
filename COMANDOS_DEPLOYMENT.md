# Comandos para Deployment - MicroAgenda

Guía rápida de comandos para desplegar MicroAgenda a producción.

---

## 🔍 Pre-Flight Checks

### 1. Verificar que no queden referencias antiguas

```bash
# Buscar "AgendaProX" (no debería encontrar nada excepto en docs)
grep -r "AgendaProX" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git

# Buscar "agendaprox.cl" (no debería encontrar nada excepto en docs)
grep -r "agendaprox.cl" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

### 2. Verificar build local

```bash
# Limpiar cache
rm -rf .next

# Build
npm run build

# Si hay errores, corregir antes de continuar
```

### 3. Verificar variables de entorno

```bash
# Ver el archivo de ejemplo
cat .env.local

# Asegurarse de tener todas las variables configuradas
```

---

## 🗄️ Database Setup (Supabase)

### 1. Ejecutar schema inicial (si es primera vez)

```bash
# En Supabase SQL Editor, copiar y pegar contenido de:
cat supabase-schema.sql
```

### 2. Ejecutar actualizaciones MVP Final

```bash
# En Supabase SQL Editor, copiar y pegar contenido de:
cat schema_update.sql
```

### 3. Verificar funciones creadas

```sql
-- En Supabase SQL Editor
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_peak_hours', 'get_recurring_clients');
```

### 4. Verificar columna agregada

```sql
-- En Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND column_name = 'next_billing_date';
```

---

## 📦 Git Setup

### 1. Inicializar repositorio (si no existe)

```bash
git init
git add .
git commit -m "feat: MicroAgenda v2.0.0 - Rebranding completo

- Cambio de nombre AgendaProX → MicroAgenda
- Nueva identidad visual (colores, tipografía)
- Funciones analíticas BD (peak hours, recurring clients)
- Cron job configurado para hora Chile (09:00)
- Documentación completa actualizada
- Legal compliance actualizado
- Ready for production deployment"
```

### 2. Crear repositorio en GitHub

```bash
# En GitHub web, crear nuevo repositorio "microagenda"
# No inicializar con README (ya lo tienes)

# Conectar repo local con GitHub
git remote add origin https://github.com/tu-usuario/microagenda.git
git branch -M main
git push -u origin main
```

### 3. Verificar subida

```bash
# Ver commits
git log --oneline

# Ver archivos trackeados
git ls-files
```

---

## ☁️ Vercel Deployment

### 1. Instalar Vercel CLI (opcional)

```bash
npm install -g vercel
vercel login
```

### 2. Deploy via Web (Recomendado)

1. Ir a [vercel.com](https://vercel.com)
2. Click "New Project"
3. Importar repo de GitHub
4. Framework preset: Next.js (detectado automático)
5. **NO hacer deploy todavía**, primero configurar variables

### 3. Configurar Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables:

```env
# CRÍTICO - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Email (Resend)
RESEND_API_KEY=re_tu-api-key

# Pagos (MercadoPago)
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-sandbox
MERCADOPAGO_WEBHOOK_SECRET=genera-token-aleatorio
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.vercel.app/api/mercadopago-webhook

# App Config
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME=MicroAgenda

# Cron Job Protection
CRON_SECRET=genera-un-token-seguro-aleatorio
```

### 4. Generar tokens seguros

```bash
# Generar CRON_SECRET
openssl rand -base64 32

# Generar MERCADOPAGO_WEBHOOK_SECRET
openssl rand -base64 32
```

### 5. Deploy

```bash
# Via CLI
vercel --prod

# O via web: Click "Deploy"
```

### 6. Verificar deploy

```bash
# Ver logs
vercel logs

# Ver deployments
vercel list
```

---

## 🌐 Dominio Custom

### 1. En Vercel Dashboard

1. Settings → Domains
2. Add Domain: `microagenda.cl`
3. Add Domain: `www.microagenda.cl`
4. Copiar records DNS que te muestra

### 2. En tu proveedor DNS

Agregar estos records:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3. Verificar

```bash
# Esperar propagación DNS (puede tomar hasta 48h, usualmente minutos)
dig microagenda.cl
dig www.microagenda.cl

# Verificar SSL
curl -I https://microagenda.cl
```

---

## 💳 MercadoPago Configuration

### 1. Actualizar Webhook URL

En [MercadoPago Developer](https://www.mercadopago.cl/developers):

1. Tu Aplicación → Webhooks
2. URL de notificación: `https://microagenda.cl/api/mercadopago-webhook`
3. Eventos: ✅ Pagos

### 2. Probar webhook

```bash
# Ver logs en Vercel
vercel logs --follow

# O en Vercel Dashboard → Logs
```

### 3. Modo Producción (cuando estés listo)

1. Cambiar a credenciales de producción
2. Actualizar `MERCADOPAGO_ACCESS_TOKEN` en Vercel
3. Probar con tarjeta real (monto pequeño)

---

## ⏰ Verificar Cron Job

### 1. Ver configuración

```bash
cat vercel.json
```

Debería mostrar:
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

### 2. Verificar en Vercel

1. Dashboard → Cron Jobs
2. Debería mostrar: `/api/send-reminders` - Diario 12:00 UTC (09:00 Chile)

### 3. Probar manualmente

```bash
# Llamar endpoint directamente (protegido con CRON_SECRET)
curl -X POST https://microagenda.cl/api/send-reminders \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

---

## 🧪 Testing Post-Deploy

### 1. Health Check

```bash
# Verificar que el sitio carga
curl -I https://microagenda.cl

# Verificar API
curl https://microagenda.cl/api/send-reminders
# Debería retornar 401 (protegido) o 200 con mensaje
```

### 2. Flujo Completo Manual

1. ✅ Ir a https://microagenda.cl
2. ✅ Registrar cuenta de prueba
3. ✅ Crear un servicio
4. ✅ Ir a agenda pública: `/u/[tu-email-antes-del-@]`
5. ✅ Hacer una reserva
6. ✅ Ver reserva en dashboard
7. ✅ Cambiar estado de cita
8. ✅ Probar pago (modo sandbox)
9. ✅ Verificar email se envió (si Resend configurado)

### 3. Mobile Testing

```bash
# Ver en diferentes dispositivos
# Usar Chrome DevTools → Device Mode
# O https://www.responsinator.com/?url=microagenda.cl
```

---

## 🔧 Comandos de Mantenimiento

### Ver logs en producción

```bash
vercel logs --follow
```

### Redeploy

```bash
git add .
git commit -m "fix: descripción del cambio"
git push

# Vercel hace auto-deploy en push
```

### Rollback

```bash
# En Vercel Dashboard → Deployments
# Click en deployment anterior → "Promote to Production"
```

### Ver variables de entorno

```bash
vercel env ls
```

### Agregar/actualizar variable

```bash
vercel env add NOMBRE_VARIABLE production
# Luego redeploy
vercel --prod
```

---

## 📊 Monitoring

### Analytics en Vercel

```bash
# Dashboard → Analytics
# Ver:
# - Pageviews
# - Visitors
# - Top pages
# - Response times
```

### Logs de errores

```bash
# Real-time
vercel logs --follow

# Últimos 100
vercel logs -n 100

# Filtrar por función
vercel logs --follow | grep "api/send-reminders"
```

### Supabase Dashboard

1. Table Editor → Verificar datos
2. SQL Editor → Queries analíticas
3. Auth → Ver usuarios registrados
4. Database → Performance insights

---

## 🚨 Troubleshooting

### Build falla

```bash
# Limpiar cache local
rm -rf .next node_modules
npm install
npm run build
```

### Variables no se aplican

```bash
# Asegurar que están en Vercel
vercel env ls

# Redeploy
vercel --prod --force
```

### Webhook no recibe eventos

```bash
# Verificar URL en MercadoPago
# Verificar logs: vercel logs --follow
# Probar manualmente:
curl -X POST https://microagenda.cl/api/mercadopago-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

### Cron no ejecuta

```bash
# Verificar configuración en Vercel Dashboard → Cron Jobs
# Ver logs de ejecución
# Probar manualmente endpoint
```

---

## 📋 Checklist Deployment

### Pre-Deploy
- [ ] Build local exitoso
- [ ] No referencias a AgendaProX/agendaprox
- [ ] Variables .env.local documentadas
- [ ] schema_update.sql preparado
- [ ] Git repo creado y pusheado

### Deploy
- [ ] Proyecto en Vercel
- [ ] Variables entorno configuradas
- [ ] Primer deploy exitoso
- [ ] schema_update.sql ejecutado en Supabase
- [ ] Dominio configurado
- [ ] DNS propagado

### Post-Deploy
- [ ] Webhook MercadoPago actualizado
- [ ] Cron job visible en Vercel
- [ ] Health checks OK
- [ ] Flujo completo probado
- [ ] Mobile responsive OK
- [ ] Legal pages accesibles

### Producción
- [ ] MercadoPago en modo producción
- [ ] Monitoring activo
- [ ] Backups configurados
- [ ] Primeros usuarios invitados

---

## 🎯 Comandos Más Usados

```bash
# Development
npm run dev                    # Servidor local
npm run build                  # Build de producción
npm run start                  # Preview build local

# Git
git status                     # Ver cambios
git add .                      # Agregar todos
git commit -m "mensaje"        # Commit
git push                       # Subir a GitHub

# Vercel
vercel                         # Deploy preview
vercel --prod                  # Deploy producción
vercel logs --follow           # Ver logs en vivo
vercel env ls                  # Ver variables

# Database
# (Ejecutar en Supabase SQL Editor)
\i schema_update.sql           # Ejecutar script
```

---

**¡Listo para Deploy!** 🚀

Para más ayuda, ver:
- [README.md](README.md)
- [REBRANDING_COMPLETO.md](REBRANDING_COMPLETO.md)
- [Docs Vercel](https://vercel.com/docs)
