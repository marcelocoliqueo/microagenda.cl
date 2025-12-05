#!/bin/bash
# Script para eliminar cron job obsoleto usando Vercel API

echo "🔧 Script para eliminar cron job obsoleto de Vercel"
echo ""
echo "Este script requiere:"
echo "1. VERCEL_TOKEN (obtenerlo de: https://vercel.com/account/tokens)"
echo "2. VERCEL_PROJECT_ID (encontrarlo en Settings → General)"
echo ""

# Verificar variables de entorno
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN no está configurado"
    echo ""
    echo "Para obtener tu token:"
    echo "1. Ve a: https://vercel.com/account/tokens"
    echo "2. Crea un nuevo token"
    echo "3. Ejecuta: export VERCEL_TOKEN=tu_token_aqui"
    exit 1
fi

if [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "❌ Error: VERCEL_PROJECT_ID no está configurado"
    echo ""
    echo "Para encontrar tu Project ID:"
    echo "1. Ve a tu proyecto en Vercel"
    echo "2. Settings → General"
    echo "3. Copia el 'Project ID'"
    echo "4. Ejecuta: export VERCEL_PROJECT_ID=tu_project_id"
    exit 1
fi

echo "📋 Listando cron jobs actuales..."
echo ""

# Listar cron jobs
curl -s -X GET \
  "https://api.vercel.com/v1/crons?projectId=${VERCEL_PROJECT_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  | jq '.crons[] | {id: .id, path: .path, schedule: .schedule}'

echo ""
echo "💡 Para eliminar un cron job específico, usa:"
echo "curl -X DELETE \"https://api.vercel.com/v1/crons/CRON_ID\" \\"
echo "  -H \"Authorization: Bearer \${VERCEL_TOKEN}\""
echo ""
echo "Reemplaza CRON_ID con el ID del cron job que quieres eliminar"

