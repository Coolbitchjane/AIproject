-- Run in the Supabase SQL editor AFTER your original schema. Safe to run more than once.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL,
  password_hash text        NOT NULL,
  role          text        NOT NULL DEFAULT 'customer',
  is_active     boolean     NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_role_chk CHECK (role IN ('customer','admin')),
  CONSTRAINT users_email_chk CHECK (position('@' in email) > 1),
  CONSTRAINT users_hash_chk CHECK (password_hash ~ '^\$(2[aby]|argon2(id|i|d))\$')
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uq ON users (lower(email));
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON users FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_uq ON profiles (user_id);
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department  text,
  ADD COLUMN IF NOT EXISTS height_cm   numeric(5,1),
  ADD COLUMN IF NOT EXISTS chest_cm    numeric(5,1),
  ADD COLUMN IF NOT EXISTS waist_cm    numeric(5,1),
  ADD COLUMN IF NOT EXISTS hips_cm     numeric(5,1),
  ADD COLUMN IF NOT EXISTS usual_size  text,
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_dept_chk') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_dept_chk
      CHECK (department IS NULL OR department IN ('women','men','kids'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_meas_chk') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_meas_chk
      CHECK ((height_cm IS NULL OR height_cm BETWEEN 50 AND 250)
         AND (chest_cm  IS NULL OR chest_cm  BETWEEN 40 AND 200)
         AND (waist_cm  IS NULL OR waist_cm  BETWEEN 30 AND 200)
         AND (hips_cm   IS NULL OR hips_cm   BETWEEN 40 AND 220));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS garments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE garments
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS name       text,
  ADD COLUMN IF NOT EXISTS style      text,
  ADD COLUMN IF NOT EXISTS size_shift smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photo_url  text,
  ADD COLUMN IF NOT EXISTS is_active  boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS tryons (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tryons
  ADD COLUMN IF NOT EXISTS profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS garment_id  uuid REFERENCES garments(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS size_tried  text,
  ADD COLUMN IF NOT EXISTS fit_result  text,
  ADD COLUMN IF NOT EXISTS liked       boolean;

CREATE INDEX IF NOT EXISTS garments_dept_style_idx ON garments (department, style) WHERE is_active;
CREATE INDEX IF NOT EXISTS tryons_profile_idx      ON tryons (profile_id, created_at DESC);
