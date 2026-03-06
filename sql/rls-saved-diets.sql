-- ============================================================
-- RLS Migration for saved_diets (auth-supabase)
-- ============================================================
-- Run this in your Supabase Dashboard > SQL Editor.
--
-- CONTEXT: The existing table has:
--   - user_id TEXT DEFAULT 'anonymous' (wrong type for auth)
--   - NO device_id column (code needs it for migration)
--   - 6 "Allow public" RLS policies (no real security)
--
-- This migration:
--   1. Adds device_id column (TEXT, for backward compat)
--   2. Converts user_id from TEXT to UUID (linked to auth.users)
--   3. Drops all "Allow public" policies
--   4. Creates per-user policies (only your own data)
--   5. Creates indexes for query performance
--
-- After running this, the app's migrateDeviceData() function
-- will claim existing device_id rows on first login.
-- ============================================================

-- 1. Add device_id column (the app uses this for pre-auth identification)
ALTER TABLE saved_diets
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- 2. Convert user_id from TEXT to UUID
--    First drop the default, then change the type, then add the FK.
--    Existing 'anonymous' values become NULL (can't cast to UUID).
ALTER TABLE saved_diets
  ALTER COLUMN user_id DROP DEFAULT;

ALTER TABLE saved_diets
  ALTER COLUMN user_id TYPE UUID
  USING CASE
    WHEN user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN user_id::UUID
    ELSE NULL
  END;

ALTER TABLE saved_diets
  ADD CONSTRAINT fk_saved_diets_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 3. Drop the old "Allow public" policies
--    (RLS is already enabled on saved_diets, we just replace the policies)
DROP POLICY IF EXISTS "Allow public read" ON saved_diets;
DROP POLICY IF EXISTS "Allow public insert" ON saved_diets;
DROP POLICY IF EXISTS "Allow public update" ON saved_diets;
DROP POLICY IF EXISTS "Allow public delete" ON saved_diets;

-- 4. Create per-user policies
--    Users can only access rows where user_id matches their JWT.
CREATE POLICY "select_own" ON saved_diets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON saved_diets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON saved_diets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON saved_diets
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_saved_diets_device_id
  ON saved_diets (device_id);

CREATE INDEX IF NOT EXISTS idx_saved_diets_user_id
  ON saved_diets (user_id);
