#!/bin/bash
# Script para aplicar migraciones a Supabase remoto

echo "🔍 Verificando conexión con Supabase..."
supabase db remote list 2>&1 || {
    echo "⚠️  No conectado. Ejecuta: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
}

echo ""
echo "📋 Migraciones pendientes:"
ls -1 supabase/migrations/*.sql | tail -2

echo ""
read -p "¿Aplicar estas migraciones? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Aplicando migraciones..."
    supabase db push
    echo "✅ Migraciones aplicadas"
else
    echo "❌ Cancelado"
fi
