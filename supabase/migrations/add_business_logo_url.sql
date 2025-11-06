-- Agregar columna business_logo_url a profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS business_logo_url TEXT;

-- Agregar comentario
COMMENT ON COLUMN public.profiles.business_logo_url IS 'URL del logo del negocio (imagen)';

