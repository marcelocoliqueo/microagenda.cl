-- Permitir lectura pública de perfiles por username
-- Esto es necesario para que la página pública /u/[username] funcione

-- Primero, eliminar la política si ya existe (para evitar conflictos)
DROP POLICY IF EXISTS "Public can view profiles by username" ON profiles;

-- Política para permitir que cualquiera pueda leer un perfil si tiene username
-- Esto permite que los clientes vean la página pública del profesional
CREATE POLICY "Public can view profiles by username"
  ON profiles FOR SELECT
  USING (username IS NOT NULL);

-- Permitir lectura pública de availability para usuarios con username
-- Esto permite que los clientes vean los horarios disponibles del profesional
DROP POLICY IF EXISTS "Public can view availability by user" ON availability;

CREATE POLICY "Public can view availability by user"
  ON availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = availability.user_id 
      AND profiles.username IS NOT NULL
    )
  );

-- Nota: Estas políticas permiten que cualquier usuario (incluso no autenticado)
-- pueda leer perfiles y disponibilidad de profesionales que tengan un username configurado.
-- Esto es necesario para la funcionalidad de páginas públicas de agendamiento.

