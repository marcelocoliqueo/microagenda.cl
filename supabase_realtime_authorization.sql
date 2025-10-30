-- Configuración de Realtime Authorization para MicroAgenda
-- Ejecuta este script en el SQL Editor de Supabase

-- ==============================================
-- IMPORTANTE: Realtime Authorization
-- ==============================================
-- Según la documentación de Supabase, para que Postgres Changes funcione
-- correctamente, NO necesitas políticas en realtime.messages a menos que uses
-- canales privados con Broadcast o Presence.
-- 
-- Para Postgres Changes con RLS, las políticas RLS en las tablas (appointments, services)
-- son suficientes. El JWT del usuario se valida automáticamente contra esas políticas.
--
-- Sin embargo, si tienes problemas de conexión, puede ser útil verificar que
-- Realtime esté correctamente configurado.

-- ==============================================
-- Verificar que las tablas estén en la publicación
-- ==============================================
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('appointments', 'services')
ORDER BY tablename;

-- ==============================================
-- Verificar políticas RLS en appointments
-- ==============================================
-- Para Postgres Changes, necesitas políticas SELECT que permitan al usuario
-- leer sus propios registros. Esto ya debería estar configurado, pero verificamos:
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'appointments' 
AND cmd = 'SELECT';

-- Deberías ver: "Users can view their own appointments" con qual = "(auth.uid() = user_id)"

-- ==============================================
-- Verificar políticas RLS en services
-- ==============================================
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'services' 
AND cmd = 'SELECT';

-- Deberías ver al menos una política SELECT que permita leer servicios

-- ==============================================
-- IMPORTANTE: Si Realtime sigue fallando
-- ==============================================
-- 1. Verifica en Dashboard: Database → Replication que las tablas tengan Realtime activado
-- 2. Verifica que no haya problemas de red/firewall bloqueando WebSockets
-- 3. Prueba crear una cita desde otra pestaña/navegador para ver si se actualiza en tiempo real
-- 4. Los errores de WebSocket pueden ser normales si hay problemas temporales de conexión

