package com.mediflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing database migration for doctors table...");

        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING'");
            logger.info("Checked/Added column 'status' to 'doctors' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'status': {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS hospital_id BIGINT");
            logger.info("Checked/Added column 'hospital_id' to 'doctors' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'hospital_id': {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
            logger.info("Checked/Added column 'phone' to 'doctors' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'phone': {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS qualification VARCHAR(200)");
            logger.info("Checked/Added column 'qualification' to 'doctors' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'qualification': {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS experience INTEGER");
            logger.info("Checked/Added column 'experience' to 'doctors' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'experience': {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages VARCHAR(250)");
            logger.info("Checked/Added column 'languages' to 'doctors' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'languages': {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS availability TEXT");
            logger.info("Checked/Added column 'availability' to 'doctors' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'availability': {}", e.getMessage());
        }

        // Add foreign key constraint for hospital_id safely
        try {
            jdbcTemplate.execute("ALTER TABLE doctors ADD CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id)");
            logger.info("Added foreign key constraint 'fk_doctor_hospital' successfully.");
        } catch (Exception e) {
            logger.info("Foreign key constraint 'fk_doctor_hospital' check completed (already exists or unable to add): {}", e.getMessage());
        }

        // Migrate status for existing/legacy doctors
        try {
            int updatedRows = jdbcTemplate.update("UPDATE doctors SET status = 'APPROVED' WHERE status IS NULL");
            logger.info("Database migration completed. Updated {} legacy doctor records to 'APPROVED' status.", updatedRows);
        } catch (Exception e) {
            logger.error("Failed to update status for legacy doctors: {}", e.getMessage());
        }

        // Add columns city, state, country to users table safely
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100)");
            logger.info("Checked/Added columns city, state, country to users table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add location columns to users: {}", e.getMessage());
        }

        // Add columns latitude, longitude to hospitals table safely
        try {
            jdbcTemplate.execute("ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION");
            jdbcTemplate.execute("ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION");
            logger.info("Checked/Added columns latitude, longitude to hospitals table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add coordinates columns to hospitals: {}", e.getMessage());
        }

        // Seed coordinates for existing hospitals based on their city
        try {
            jdbcTemplate.update("UPDATE hospitals SET latitude = 23.0225, longitude = 72.5714 WHERE LOWER(city) = 'ahmedabad'");
            jdbcTemplate.update("UPDATE hospitals SET latitude = 21.1702, longitude = 72.8311 WHERE LOWER(city) = 'surat'");
            jdbcTemplate.update("UPDATE hospitals SET latitude = 22.3039, longitude = 70.8022 WHERE LOWER(city) = 'rajkot'");
            jdbcTemplate.update("UPDATE hospitals SET latitude = 22.3072, longitude = 73.1812 WHERE LOWER(city) = 'vadodara'");
            jdbcTemplate.update("UPDATE hospitals SET latitude = 19.0760, longitude = 72.8777 WHERE LOWER(city) = 'mumbai'");
            jdbcTemplate.update("UPDATE hospitals SET latitude = 28.7041, longitude = 77.1025 WHERE LOWER(city) = 'delhi'");
            logger.info("Seeded coordinates for existing hospitals based on city names.");
        } catch (Exception e) {
            logger.error("Failed to seed coordinates for hospitals: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version integer DEFAULT 0");
            int updated = jdbcTemplate.update("UPDATE users SET token_version = 0 WHERE token_version IS NULL");
            if (updated > 0) {
                logger.info("Set token_version=0 for {} existing users.", updated);
            }
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN token_version SET NOT NULL");
            logger.info("Checked/Added column 'token_version' to 'users' table.");
        } catch (Exception e) {
            logger.warn("Failed to check/add column 'token_version': {}", e.getMessage());
        }
    }
}

