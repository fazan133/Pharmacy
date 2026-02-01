-- ============================================
-- AUTH TRIGGER SETUP
-- ============================================
-- This file must be run AFTER schema.sql
-- 
-- OPTION 1: Run in Supabase SQL Editor with service_role
-- Go to Project Settings > Database > Connection string
-- Use the "service_role" connection or run as postgres user
--
-- OPTION 2: Create via Supabase Dashboard
-- Go to Database > Triggers > Create a new trigger
-- - Name: on_auth_user_created
-- - Table: auth.users
-- - Events: INSERT
-- - Function: public.handle_new_user
-- ============================================

-- Create trigger on auth.users to auto-create profile
-- This requires elevated permissions (postgres/service_role)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
