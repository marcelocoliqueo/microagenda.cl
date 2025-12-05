#!/bin/bash
# Script para listar y eliminar cron jobs obsoletos de Vercel

PROJECT_ID="prj_utt2htkgfSVX89L3SnP7bBmAE6tF"

echo "🔍 Listando cron jobs del proyecto..."
echo ""

# Intentar obtener token de varias fuentes
TOKEN=""

# 1. Desde variable de entorno
if [ ! -z "$VERCEL_TOKEN" ]; then
    TOKEN="$VERCEL_TOKEN"
    echo "✅ Token encontrado en variable de entorno"
fi

# 2. Desde archivo de configuración de Vercel
if [ -z "$TOKEN" ] && [ -f ~/.vercel/auth.json ]; then
    TOKEN=$(cat ~/.vercel/auth.json | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/' | head -1)
    if [ ! -z "$TOKEN" ]; then
        echo "✅ Token encontrado en ~/.vercel/auth.json"
    fi
fi

if [ -z "$TOKEN" ]; then
    echo "❌ No se encontró token de Vercel"
    echo ""
    echo "Para obtener tu token:"
    echo "1. Ve a: https://vercel.com/account/tokens"
    echo "2. Crea un nuevo token o copia uno existente"
    echo "3. Ejecuta: export VERCEL_TOKEN=tu_token_aqui"
    echo "4. Luego ejecuta este script nuevamente"
    exit 1
fi

echo "📋 Listando cron jobs..."
echo ""

# Listar cron jobs usando la API
RESPONSE=$(curl -s -X GET \
  "https://api.vercel.com/v1/crons?projectId=${PROJECT_ID}" \
  -H "Authorization: Bearer ${TOKEN}")

# Verificar si hay errores
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Error al listar cron jobs:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Mostrar cron jobs
echo "$RESPONSE" | jq -r '.crons[] | "ID: \(.id)\nPath: \(.path)\nSchedule: \(.schedule)\n---"' 2>/dev/null

if [ $? -ne 0 ]; then
    echo "⚠️ jq no está instalado, mostrando respuesta raw:"
    echo "$RESPONSE"
    echo ""
    echo "Para instalar jq: brew install jq"
    exit 1
fi

# Buscar el cron job obsoleto
OBSOLETE_CRON_ID=$(echo "$RESPONSE" | jq -r '.crons[] | select(.path == "/api/cron/auto-update-appointments") | .id' 2>/dev/null)

if [ ! -z "$OBSOLETE_CRON_ID" ] && [ "$OBSOLETE_CRON_ID" != "null" ]; then
    echo ""
    echo "🗑️  Cron job obsoleto encontrado:"
    echo "   ID: $OBSOLETE_CRON_ID"
    echo "   Path: /api/cron/auto-update-appointments"
    echo ""
    read -p "¿Eliminar este cron job? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🗑️  Eliminando cron job..."
        DELETE_RESPONSE=$(curl -s -X DELETE \
          "https://api.vercel.com/v1/crons/${OBSOLETE_CRON_ID}" \
          -H "Authorization: Bearer ${TOKEN}")
        
        if echo "$DELETE_RESPONSE" | grep -q '"error"'; then
            echo "❌ Error al eliminar:"
            echo "$DELETE_RESPONSE" | jq '.' 2>/dev/null || echo "$DELETE_RESPONSE"
        else
            echo "✅ Cron job eliminado exitosamente"
        fi
    else
        echo "❌ Operación cancelada"
    fi
else
    echo ""
    echo "✅ No se encontró el cron job obsoleto /api/cron/auto-update-appointments"
    echo "   Puede que ya haya sido eliminado o no existe"
fi

