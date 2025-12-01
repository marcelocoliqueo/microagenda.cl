-- Complete Database Audit Script
-- Execute this to get a full overview of your database state

-- ============================================
-- 1. DATABASE OVERVIEW
-- ============================================

SELECT 'DATABASE OVERVIEW' as section;
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 2. PROFILES TABLE STRUCTURE
-- ============================================

SELECT 'PROFILES TABLE STRUCTURE' as section;
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 3. CHECK CRITICAL FIELDS
-- ============================================

SELECT 'CRITICAL FIELDS CHECK' as section;
SELECT 
  'send_review_request exists' as check_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'send_review_request'
  ) as result
UNION ALL
SELECT 
  'subscription_status exists',
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  )
UNION ALL
SELECT 
  'auto_confirm exists',
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'auto_confirm'
  );

-- ============================================
-- 4. SUBSCRIPTION STATUS DISTRIBUTION
-- ============================================

SELECT 'SUBSCRIPTION STATUS DISTRIBUTION' as section;
SELECT 
  COALESCE(subscription_status, 'NULL') as status,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage,
  MIN(created_at) as oldest_user,
  MAX(created_at) as newest_user
FROM profiles
GROUP BY subscription_status
ORDER BY user_count DESC;

-- ============================================
-- 5. RECENT USERS (Last 10)
-- ============================================

SELECT 'RECENT USERS (Last 10)' as section;
SELECT 
  id,
  name,
  email,
  subscription_status,
  auto_confirm,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'send_review_request'
    ) THEN 'Field exists'
    ELSE 'Field missing'
  END as send_review_request_status,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 6. TRIGGERS AND FUNCTIONS
-- ============================================

SELECT 'ACTIVE TRIGGERS' as section;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

SELECT 'CUSTOM FUNCTIONS' as section;
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- ============================================
-- 7. PLANS TABLE
-- ============================================

SELECT 'AVAILABLE PLANS' as section;
SELECT 
  id,
  name,
  price,
  currency,
  period,
  is_active,
  created_at
FROM plans
ORDER BY price;

-- ============================================
-- 8. SUBSCRIPTIONS OVERVIEW
-- ============================================

SELECT 'SUBSCRIPTIONS OVERVIEW' as section;
SELECT 
  status,
  trial,
  COUNT(*) as count
FROM subscriptions
GROUP BY status, trial
ORDER BY count DESC;

-- ============================================
-- 9. SERVICES COUNT
-- ============================================

SELECT 'SERVICES STATISTICS' as section;
SELECT 
  COUNT(DISTINCT user_id) as users_with_services,
  COUNT(*) as total_services,
  ROUND(AVG(price), 2) as avg_price,
  ROUND(AVG(duration), 2) as avg_duration_minutes
FROM services;

-- ============================================
-- 10. APPOINTMENTS STATISTICS
-- ============================================

SELECT 'APPOINTMENTS STATISTICS' as section;
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- ============================================
-- 11. ROW LEVEL SECURITY STATUS
-- ============================================

SELECT 'ROW LEVEL SECURITY (RLS) STATUS' as section;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 12. STORAGE BUCKETS
-- ============================================

SELECT 'STORAGE BUCKETS' as section;
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY created_at;

-- ============================================
-- SUMMARY
-- ============================================

SELECT 'DATABASE SUMMARY' as section;
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE subscription_status = 'trial') as trial_users,
  (SELECT COUNT(*) FROM profiles WHERE subscription_status = 'active') as active_users,
  (SELECT COUNT(*) FROM services) as total_services,
  (SELECT COUNT(*) FROM appointments) as total_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed') as confirmed_appointments;
