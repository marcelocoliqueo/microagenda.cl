-- Script para verificar el estado actual de la base de datos
-- Execute this in Supabase SQL Editor

-- 1. Verificar estructura de la tabla profiles
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar si existe el campo send_review_request
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND column_name = 'send_review_request'
) AS send_review_request_exists;

-- 3. Verificar valores actuales de subscription_status
SELECT 
  subscription_status, 
  COUNT(*) as count,
  MIN(created_at) as first_user,
  MAX(created_at) as last_user
FROM profiles
GROUP BY subscription_status
ORDER BY count DESC;

-- 4. Verificar el trigger handle_new_user
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Verificar la función handle_new_user
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 6. Verificar últimos 5 usuarios creados
SELECT 
  id,
  name,
  email,
  subscription_status,
  auto_confirm,
  send_review_request,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 7. Verificar planes disponibles
SELECT * FROM plans;

-- 8. Verificar suscripciones activas
SELECT 
  s.id,
  s.user_id,
  p.name as user_name,
  s.status,
  s.trial,
  s.start_date,
  s.end_date
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC
LIMIT 5;
