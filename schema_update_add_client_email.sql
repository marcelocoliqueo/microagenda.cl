-- Agregar campo client_email a la tabla appointments
-- Ejecutar en Supabase SQL Editor

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Comentario: Este campo es opcional y permite enviar emails de confirmación a los clientes

