-- Migración: Insertar plan por defecto
-- Fecha: Diciembre 2024
-- Descripción: Inserta el plan mensual de MicroAgenda si no existe

-- Insertar plan por defecto (actualizado a "Mensual")
INSERT INTO plans (name, price, currency, period, is_active)
VALUES ('Mensual', 8500, 'CLP', 'monthly', true)
ON CONFLICT DO NOTHING;

-- Verificar que se insertó correctamente
SELECT * FROM plans WHERE is_active = true;

