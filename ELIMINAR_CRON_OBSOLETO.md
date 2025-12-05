# Cómo Eliminar el Cron Job Obsoleto en Vercel

## Problema
Vercel muestra un cron job `/api/cron/auto-update-appointments` que ya no existe en el código y no se puede eliminar desde la UI.

## Soluciones

### ✅ Solución 1: Usar Vercel CLI (Recomendado)

1. **Instalar Vercel CLI** (si no lo tienes):
```bash
npm i -g vercel
```

2. **Iniciar sesión**:
```bash
vercel login
```

3. **Listar cron jobs actuales**:
```bash
vercel cron ls
```

4. **Eliminar el cron job obsoleto**:
```bash
# Primero, identifica el ID del cron job obsoleto
vercel cron ls

# Luego elimínalo (reemplaza CRON_ID con el ID real)
vercel cron rm CRON_ID
```

### ✅ Solución 2: Deploy Limpio (Más Simple)

1. **Hacer commit de los cambios**:
```bash
git add vercel.json app/u/[username]/page.tsx
git commit -m "fix: corregir error TypeScript y limpiar cron jobs"
git push origin main
```

2. **Esperar el deploy** - Vercel debería sincronizar automáticamente

3. **Si persiste**, ve a Vercel Dashboard → Settings → Cron Jobs y verifica que solo aparezcan los 2 correctos

### ✅ Solución 3: Contactar Soporte de Vercel

Si ninguna de las anteriores funciona:

1. Ve a: https://vercel.com/support
2. Explica que tienes un cron job obsoleto que no puedes eliminar
3. Proporciona:
   - Nombre del proyecto
   - Ruta del cron job: `/api/cron/auto-update-appointments`
   - Que ya no existe en tu `vercel.json`

## Verificación

Después de eliminar, verifica que solo tengas estos 2 cron jobs:

1. `/api/send-reminders` - Cada hora (`0 * * * *`)
2. `/api/cron/check-trial-expiration` - Diario a las 3:00 UTC (`0 3 * * *`)

## Nota Importante

El plan gratuito de Vercel (Hobby) solo permite **2 cron jobs**. Si tienes más, los deployments fallarán.

