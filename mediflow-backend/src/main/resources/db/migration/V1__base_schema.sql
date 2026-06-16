-- V1: Base Schema
-- This migration complements JPA ddl-auto: update by adding constraints,
-- indexes, and columns that JPA entity definitions may not capture perfectly.

-- Add missing columns to doctors table (defensive - JPA may have already created them)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS hospital_id BIGINT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS qualification VARCHAR(200);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS experience INTEGER;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages VARCHAR(250);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS availability TEXT;

-- Add missing columns to hospitals table
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add foreign key constraint for doctors -> hospitals (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_doctor_hospital'
    ) THEN
        ALTER TABLE doctors ADD CONSTRAINT fk_doctor_hospital
            FOREIGN KEY (hospital_id) REFERENCES hospitals(id);
    END IF;
END $$;

-- Set default status for legacy doctors
UPDATE doctors SET status = 'APPROVED' WHERE status IS NULL;
