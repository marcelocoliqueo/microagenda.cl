-- Crear bucket 'post_backgrounds' en Supabase Storage para fondos de posts
-- Nota: Esto debe ejecutarse en el SQL Editor de Supabase

-- Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('post_backgrounds', 'post_backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si existen (para poder recrearlas)
DROP POLICY IF EXISTS "Public Access - Post Backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own post backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post backgrounds" ON storage.objects;

-- Política: Permitir lectura pública de los archivos
CREATE POLICY "Public Access - Post Backgrounds"
ON storage.objects FOR SELECT
USING (bucket_id = 'post_backgrounds');

-- Política: Permitir a usuarios autenticados subir archivos
CREATE POLICY "Authenticated users can upload post backgrounds"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post_backgrounds' AND
  auth.role() = 'authenticated' AND
  name = 'user_' || auth.uid()::text || '.jpg'
);

-- Política: Permitir a usuarios autenticados actualizar sus propios archivos
CREATE POLICY "Users can update their own post backgrounds"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post_backgrounds' AND
  auth.role() = 'authenticated' AND
  name = 'user_' || auth.uid()::text || '.jpg'
)
WITH CHECK (
  bucket_id = 'post_backgrounds' AND
  auth.role() = 'authenticated' AND
  name = 'user_' || auth.uid()::text || '.jpg'
);

-- Política: Permitir a usuarios autenticados eliminar sus propios archivos
CREATE POLICY "Users can delete their own post backgrounds"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post_backgrounds' AND
  auth.role() = 'authenticated' AND
  name = 'user_' || auth.uid()::text || '.jpg'
);

