/**
 * Script para simular renovación de suscripción
 * Actualiza directamente la BD como si hubiera recibido un pago exitoso
 */

// Este script usa el MCP de Supabase directamente
// Ejecuta: npx tsx scripts/simulate-renewal.ts

console.log(`
🔄 Simulador de Renovación de Suscripción
==========================================

Este script simula una renovación exitosa actualizando directamente la BD.

Para ejecutarlo, usa el MCP de Supabase con esta query:

UPDATE profiles
SET subscription_status = 'active'
WHERE email = 'marcelo.coliqueo@gmail.com';

INSERT INTO subscriptions (user_id, plan_id, status, start_date, renewal_date, trial)
SELECT 
  p.id,
  pl.id,
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  false
FROM profiles p
CROSS JOIN plans pl
WHERE p.email = 'marcelo.coliqueo@gmail.com'
  AND pl.is_active = true
ON CONFLICT (mercadopago_id) DO NOTHING;

O usa el script test-renewal.ts que hace esto automáticamente.
`);

