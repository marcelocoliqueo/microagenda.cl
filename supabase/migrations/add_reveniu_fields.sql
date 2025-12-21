-- Migración: Agregar campos de Reveniu a las tablas de suscripciones y pagos
-- Fecha: Enero 2025
-- Descripción: Agrega campos para almacenar IDs de Reveniu manteniendo compatibilidad con MercadoPago

-- ============================================
-- 1. Agregar campos a la tabla subscriptions
-- ============================================

-- Agregar columna reveniu_id para almacenar el ID de suscripción en Reveniu
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS reveniu_id TEXT;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_subscriptions_reveniu_id 
ON subscriptions(reveniu_id) 
WHERE reveniu_id IS NOT NULL;

-- ============================================
-- 2. Agregar campos a la tabla payments
-- ============================================

-- Agregar columna reveniu_payment_id para almacenar el ID de pago en Reveniu
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS reveniu_payment_id TEXT;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_payments_reveniu_payment_id 
ON payments(reveniu_payment_id) 
WHERE reveniu_payment_id IS NOT NULL;

-- ============================================
-- 3. Comentarios para documentación
-- ============================================

COMMENT ON COLUMN subscriptions.reveniu_id IS 'ID de la suscripción en Reveniu. Null si la suscripción es de MercadoPago.';
COMMENT ON COLUMN payments.reveniu_payment_id IS 'ID del pago en Reveniu. Null si el pago es de MercadoPago.';

-- ============================================
-- 4. Verificación
-- ============================================

-- Verificar que las columnas fueron agregadas
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions' 
  AND column_name IN ('mercadopago_id', 'reveniu_id')
ORDER BY column_name;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'payments' 
  AND column_name IN ('mercadopago_payment_id', 'reveniu_payment_id')
ORDER BY column_name;

