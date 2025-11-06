-- Agregar campos para onboarding y username
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Crear índice para username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Agregar comentarios
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indica si el usuario completó la configuración inicial';
COMMENT ON COLUMN public.profiles.username IS 'Nombre de usuario único para la URL pública (ej: /u/username)';

