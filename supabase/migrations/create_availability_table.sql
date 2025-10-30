-- Crear tabla de horarios de disponibilidad
CREATE TABLE IF NOT EXISTS public.availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver solo sus propios horarios
CREATE POLICY "Users can view their own availability"
  ON public.availability
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios horarios
CREATE POLICY "Users can insert their own availability"
  ON public.availability
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios horarios
CREATE POLICY "Users can update their own availability"
  ON public.availability
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios horarios
CREATE POLICY "Users can delete their own availability"
  ON public.availability
  FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para mejorar rendimiento en consultas por usuario
CREATE INDEX idx_availability_user_id ON public.availability(user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER availability_updated_at_trigger
  BEFORE UPDATE ON public.availability
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_updated_at();
