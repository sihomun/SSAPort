-- SSAPort Supabase Setup Script

-- 1. users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  host_university text,
  country text,
  departure_date date,
  stay_weeks int,
  is_first_time bool,
  created_at timestamptz DEFAULT now()
);

-- 2. checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  university text,
  title text,
  description text,
  deadline_label text,
  links jsonb,
  "order" int
);

-- 3. user_checklist table
CREATE TABLE IF NOT EXISTS user_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  item_id uuid REFERENCES checklist_items(id),
  is_done bool DEFAULT false,
  done_at timestamptz
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own" ON users;
CREATE POLICY "users_own" ON users USING (auth.uid() = id);

ALTER TABLE user_checklist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklist_own" ON user_checklist;
CREATE POLICY "checklist_own" ON user_checklist USING (auth.uid() = user_id);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "items_read" ON checklist_items;
CREATE POLICY "items_read" ON checklist_items FOR SELECT USING (auth.role() = 'authenticated');
