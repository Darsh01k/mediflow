-- V3: Add missing columns to hospitals table
-- These columns exist in the Hospital entity but were not included in V1.
-- On production databases where JPA ddl-auto may not have created them,
-- this migration ensures they exist.

ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS hospital_type VARCHAR(100);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS facilities TEXT;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS number_of_beds INTEGER;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS emergency_services_available BOOLEAN DEFAULT FALSE;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS website VARCHAR(200);
