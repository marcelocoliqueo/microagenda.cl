-- Agregar campo business_logo_url a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_logo_url TEXT;

-- Añadir comentario para documentar el campo
COMMENT ON COLUMN public.profiles.business_logo_url IS 'URL de la imagen del logo del negocio, almacenada en Supabase Storage';

