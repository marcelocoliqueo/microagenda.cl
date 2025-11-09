-- Script para limpiar horarios con solapamientos
-- Este script elimina todos los horarios de un usuario específico
-- para que pueda empezar limpio con la nueva validación

-- OPCIÓN 1: Eliminar todos los horarios de un usuario específico por email
-- Descomenta y ejecuta esta sección si quieres eliminar todos los horarios de marcelo.coliqueo@gmail.com

DELETE FROM public.availability
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'marcelo.coliqueo@gmail.com'
);

-- OPCIÓN 2: Si prefieres eliminar solo los bloques solapados del lunes
-- (descomenta esta sección y comenta la anterior)

/*
WITH overlapping_blocks AS (
  SELECT 
    a1.id,
    a1.user_id,
    a1.day_of_week,
    a1.start_time,
    a1.end_time
  FROM public.availability a1
  INNER JOIN public.availability a2 ON (
    a1.user_id = a2.user_id 
    AND a1.day_of_week = a2.day_of_week
    AND a1.id != a2.id
    AND a1.day_of_week = 'monday'
    AND (
      -- Bloque 1 contiene completamente a bloque 2
      (a1.start_time <= a2.start_time AND a1.end_time >= a2.end_time)
      OR
      -- Bloque 2 contiene completamente a bloque 1
      (a2.start_time <= a1.start_time AND a2.end_time >= a1.end_time)
      OR
      -- Solapamiento parcial
      (a1.start_time < a2.end_time AND a1.end_time > a2.start_time)
    )
  )
  WHERE a1.user_id = (SELECT id FROM auth.users WHERE email = 'marcelo.coliqueo@gmail.com')
)
DELETE FROM public.availability
WHERE id IN (SELECT id FROM overlapping_blocks);
*/

-- OPCIÓN 3: Ver primero qué horarios tiene el usuario antes de eliminar
-- (ejecuta esto primero para ver qué se va a eliminar)

/*
SELECT 
  a.id,
  a.day_of_week,
  a.start_time,
  a.end_time,
  a.enabled,
  u.email
FROM public.availability a
INNER JOIN auth.users u ON a.user_id = u.id
WHERE u.email = 'marcelo.coliqueo@gmail.com'
ORDER BY a.day_of_week, a.start_time;
*/

