# Instrucciones para Eliminar Cron Job Obsoleto

## Paso 1: Obtener Token de Vercel

1. Ve a: https://vercel.com/account/tokens
2. Haz click en "Create Token"
3. Dale un nombre (ej: "Eliminar cron obsoleto")
4. Copia el token que se genera (solo se muestra una vez)

## Paso 2: Ejecutar el Script

Ejecuta este comando reemplazando `TU_TOKEN_AQUI` con el token que copiaste:

```bash
export VERCEL_TOKEN=TU_TOKEN_AQUI
node scripts/eliminar-cron.js
```

El script te mostrará:
- Todos los cron jobs actuales
- Te preguntará si quieres eliminar el obsoleto `/api/cron/auto-update-appointments`
- Confirma con 's' para eliminarlo

## Alternativa: Usar la API Directamente

Si prefieres hacerlo manualmente con curl:

```bash
# 1. Listar cron jobs (reemplaza TU_TOKEN)
curl -X GET "https://api.vercel.com/v1/crons?projectId=prj_utt2htkgfSVX89L3SnP7bBmAE6tF" \
  -H "Authorization: Bearer TU_TOKEN" | jq '.'

# 2. Identificar el ID del cron job obsoleto (busca el que tiene path: "/api/cron/auto-update-appointments")

# 3. Eliminarlo (reemplaza CRON_ID con el ID encontrado)
curl -X DELETE "https://api.vercel.com/v1/crons/CRON_ID" \
  -H "Authorization: Bearer TU_TOKEN"
```

## Verificación

Después de eliminar, verifica en Vercel Dashboard → Settings → Cron Jobs que solo aparezcan estos 2:

1. `/api/send-reminders` - Cada hora
2. `/api/cron/check-trial-expiration` - Diario a las 3:00 UTC

