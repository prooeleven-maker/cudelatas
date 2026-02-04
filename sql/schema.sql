-- Create license_keys table
CREATE TABLE IF NOT EXISTS license_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_hash TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT UNIQUE,
  password_hash TEXT,
  hwid TEXT,
  is_registered BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_license_keys_key_hash ON license_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_license_keys_is_active ON license_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_license_keys_expires_at ON license_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_license_keys_username ON license_keys(username);
CREATE INDEX IF NOT EXISTS idx_license_keys_hwid ON license_keys(hwid);

-- Enable Row Level Security (RLS)
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view license keys
CREATE POLICY "Users can view license keys" ON license_keys
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can insert license keys
CREATE POLICY "Users can insert license keys" ON license_keys
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update license keys
CREATE POLICY "Users can update license keys" ON license_keys
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete license keys
CREATE POLICY "Users can delete license keys" ON license_keys
  FOR DELETE USING (auth.role() = 'authenticated');

-- Function to update last_used_at timestamp
CREATE OR REPLACE FUNCTION update_last_used_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_used_at when key is validated
CREATE TRIGGER trigger_update_last_used_at
  BEFORE UPDATE ON license_keys
  FOR EACH ROW
  WHEN (OLD.last_used_at IS DISTINCT FROM NEW.last_used_at)
  EXECUTE FUNCTION update_last_used_at();

-- Migration for existing tables (run if table already exists)
-- ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
-- ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS password_hash TEXT;
-- ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS hwid TEXT;
-- ALTER TABLE license_keys ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT false;
