#!/bin/bash
# Diagnóstico completo de configuración de Cron Jobs

echo "=== DIAGNÓSTICO DE CRON JOBS ==="
echo ""

echo "1. Contenido de vercel.json:"
cat vercel.json
echo ""

echo "2. Número de cron jobs en vercel.json:"
cat vercel.json | grep -o '"path"' | wc -l
echo ""

echo "3. Rutas de cron jobs configuradas:"
grep '"path"' vercel.json
echo ""

echo "4. Todos los archivos route.ts en app/api:"
find app/api -name "route.ts" -type f
echo ""

echo "5. Archivos en app/api/cron:"
ls -la app/api/cron/ 2>/dev/null || echo "No existe app/api/cron/"
echo ""

echo "6. Búsqueda de archivos vercel.json duplicados:"
find . -name "vercel.json" -o -name ".vercel.json"
echo ""

echo "7. Contenido de .vercel/project.json:"
cat .vercel/project.json 2>/dev/null || echo "No existe"
echo ""

echo "=== FIN DEL DIAGNÓSTICO ==="
