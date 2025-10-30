-- Crear bucket 'public-assets' en Supabase Storage para logos de negocios
-- Nota: Esto debe ejecutarse en el SQL Editor de Supabase

-- Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Permitir lectura pública de los archivos
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

-- Política: Permitir a usuarios autenticados subir archivos
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated'
);

-- Política: Permitir a usuarios autenticados actualizar sus propios archivos
CREATE POLICY IF NOT EXISTS "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Permitir a usuarios autenticados eliminar sus propios archivos
CREATE POLICY IF NOT EXISTS "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-assets' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

