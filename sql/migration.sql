-- Migration script for existing license_keys table
-- Run this in Supabase SQL Editor if the table already exists

ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS hwid TEXT;
ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT false;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_license_keys_username ON license_keys(username);
CREATE INDEX IF NOT EXISTS idx_license_keys_hwid ON license_keys(hwid);
