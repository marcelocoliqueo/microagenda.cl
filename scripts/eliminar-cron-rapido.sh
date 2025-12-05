#!/bin/bash
# Script rápido para eliminar cron job obsoleto - SOLO NECESITAS EL TOKEN

echo "🔧 Eliminador de Cron Job Obsoleto"
echo ""
echo "Este script eliminará el cron job /api/cron/auto-update-appointments"
echo ""

# Pedir token si no está en variable de entorno
if [ -z "$VERCEL_TOKEN" ]; then
    echo "📝 Necesito tu token de Vercel"
    echo ""
    echo "Para obtenerlo:"
    echo "1. Ve a: https://vercel.com/account/tokens"
    echo "2. Crea un token nuevo"
    echo "3. Cópialo y pégalo aquí"
    echo ""
    read -p "Pega tu token de Vercel: " VERCEL_TOKEN
    echo ""
fi

PROJECT_ID="prj_utt2htkgfSVX89L3SnP7bBmAE6tF"

echo "🔍 Buscando cron job obsoleto..."
echo ""

# Listar cron jobs
RESPONSE=$(curl -s -X GET \
  "https://api.vercel.com/v1/crons?projectId=${PROJECT_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}")

# Verificar si hay error
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Error:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Buscar el cron job obsoleto
CRON_ID=$(echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for cron in data.get('crons', []):
    if cron.get('path') == '/api/cron/auto-update-appointments':
        print(cron['id'])
        break
" 2>/dev/null)

if [ -z "$CRON_ID" ]; then
    echo "✅ No se encontró el cron job obsoleto"
    echo "   Puede que ya haya sido eliminado"
    exit 0
fi

echo "🗑️  Cron job obsoleto encontrado:"
echo "   ID: $CRON_ID"
echo "   Path: /api/cron/auto-update-appointments"
echo ""
echo "Eliminando..."
echo ""

# Eliminar
DELETE_RESPONSE=$(curl -s -X DELETE \
  "https://api.vercel.com/v1/crons/${CRON_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}")

if echo "$DELETE_RESPONSE" | grep -q '"error"'; then
    echo "❌ Error al eliminar:"
    echo "$DELETE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DELETE_RESPONSE"
    exit 1
else
    echo "✅ Cron job eliminado exitosamente!"
    echo ""
    echo "Ahora puedes hacer deploy sin problemas"
fi

