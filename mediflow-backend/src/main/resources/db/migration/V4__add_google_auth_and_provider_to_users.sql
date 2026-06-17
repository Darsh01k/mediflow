-- V4: Add google_id and provider columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'LOCAL';

-- Assign provider = 'LOCAL' for existing accounts
UPDATE users SET provider = 'LOCAL' WHERE provider IS NULL;

-- Enforce NOT NULL constraint on provider column
ALTER TABLE users ALTER COLUMN provider SET NOT NULL;
