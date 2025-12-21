-- Migración: Limpiar planes duplicados
-- Fecha: Diciembre 2024
-- Descripción: Eliminar planes duplicados y dejar solo el más reciente

-- Desactivar todos los planes excepto el más reciente
UPDATE plans
SET is_active = false
WHERE id != (
  SELECT id 
  FROM plans 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Verificar que solo quede uno activo
SELECT * FROM plans ORDER BY created_at DESC;

