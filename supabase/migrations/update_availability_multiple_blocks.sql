-- Migración para permitir múltiples bloques de horario por día
-- Esto elimina la restricción UNIQUE en (user_id, day_of_week)

-- Primero, eliminar la restricción UNIQUE si existe
ALTER TABLE public.availability 
DROP CONSTRAINT IF EXISTS availability_user_id_day_of_week_key;

-- Crear un nuevo índice compuesto para mejorar consultas
-- (permitiendo múltiples filas con mismo user_id y day_of_week)
CREATE INDEX IF NOT EXISTS idx_availability_user_day 
ON public.availability(user_id, day_of_week);

-- Asegurarse de que no haya duplicados antes de permitir múltiples bloques
-- Esto es opcional, pero puede ayudar con datos existentes
-- Si un usuario tiene múltiples registros para el mismo día, 
-- se pueden consolidar manualmente o mantener separados

