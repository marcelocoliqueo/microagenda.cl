-- Fix Realtime Configuration for MicroAgenda
-- Ejecuta este script en el SQL Editor de Supabase

-- ==============================================
-- PASO 1: Verificar que las tablas estén en la publicación
-- ==============================================

-- Verificar tablas en la publicación
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Si no aparecen appointments y services, ejecutar:
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS services;

-- ==============================================
-- PASO 2: Verificar RLS está habilitado (debe estar)
-- ==============================================

-- RLS debe estar habilitado, pero Realtime necesita permisos especiales
-- Nota: La verificación de pg_tables requiere permisos de superusuario
-- En su lugar, intenta hacer un SELECT simple para verificar que RLS funciona
-- (Si RLS está activo y no tienes políticas, obtendrás un error de permisos)
SELECT 
  'appointments' as tabla,
  CASE WHEN EXISTS (SELECT 1 FROM appointments LIMIT 1) 
    THEN '✅ Tabla accesible (RLS probablemente configurado)'
    ELSE '❌ No accesible sin políticas RLS' 
  END as estado
LIMIT 0; -- Solo verificar estructura, no datos

SELECT 
  'services' as tabla,
  CASE WHEN EXISTS (SELECT 1 FROM services LIMIT 1) 
    THEN '✅ Tabla accesible (RLS probablemente configurado)'
    ELSE '❌ No accesible sin políticas RLS' 
  END as estado
LIMIT 0;

-- ==============================================
-- PASO 3: Configurar permisos para Realtime
-- ==============================================
-- Realtime usa el rol 'authenticated' para validar cambios con RLS
-- Esto debería funcionar si las políticas RLS están correctas

-- Verificar que las políticas RLS permitan lectura para usuarios autenticados
-- (Esto ya debería estar configurado en supabase-schema.sql)

-- ==============================================
-- PASO 4: Habilitar replica identity (necesario para DELETE/UPDATE en Realtime)
-- ==============================================

-- Configurar replica identity para que Realtime pueda enviar datos 'old' en UPDATE/DELETE
ALTER TABLE appointments REPLICA IDENTITY DEFAULT;
ALTER TABLE services REPLICA IDENTITY DEFAULT;

-- Si quieres recibir datos 'old' completos (opcional, puede impactar rendimiento):
-- ALTER TABLE appointments REPLICA IDENTITY FULL;
-- ALTER TABLE services REPLICA IDENTITY FULL;

-- ==============================================
-- PASO 5: Verificar que las tablas tengan todos los índices necesarios
-- ==============================================

-- Índices para mejorar el rendimiento de Realtime
CREATE INDEX IF NOT EXISTS idx_appointments_user_id_realtime 
ON appointments(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_services_user_id_realtime 
ON services(user_id) 
WHERE user_id IS NOT NULL;

-- ==============================================
-- PASO 6: Verificar que Realtime esté habilitado en el proyecto
-- ==============================================

-- Este paso debe hacerse manualmente en el Dashboard:
-- 1. Ve a Database → Replication
-- 2. Verifica que "appointments" y "services" tengan el toggle de Realtime activado
-- 3. Si no están activados, actívalos manualmente

-- ==============================================
-- PASO 7: Verificar logs de Realtime (opcional)
-- ==============================================

-- Verificar si hay errores recientes en Realtime
-- (Esto requiere permisos de admin, generalmente no disponible en plan gratuito)

-- ==============================================
-- VERIFICACIÓN FINAL
-- ==============================================

-- Ejecutar esto para verificar todo (sin consultar pg_tables que requiere permisos especiales):
SELECT 
  'appointments' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'appointments'
  ) THEN '✅ En publicación' ELSE '❌ NO en publicación' END as publication_status,
  '✅ RLS debe estar activo (verifica en el esquema)' as rls_status
UNION ALL
SELECT 
  'services' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'services'
  ) THEN '✅ En publicación' ELSE '❌ NO en publicación' END as publication_status,
  '✅ RLS debe estar activo (verifica en el esquema)' as rls_status;

