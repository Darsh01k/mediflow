-- V2: Seed Coordinates for Existing Hospitals
-- Populates latitude/longitude for hospitals with known Indian cities.

UPDATE hospitals SET latitude = 23.0225, longitude = 72.5714 WHERE LOWER(city) = 'ahmedabad' AND latitude IS NULL;
UPDATE hospitals SET latitude = 21.1702, longitude = 72.8311 WHERE LOWER(city) = 'surat' AND latitude IS NULL;
UPDATE hospitals SET latitude = 22.3039, longitude = 70.8022 WHERE LOWER(city) = 'rajkot' AND latitude IS NULL;
UPDATE hospitals SET latitude = 22.3072, longitude = 73.1812 WHERE LOWER(city) = 'vadodara' AND latitude IS NULL;
UPDATE hospitals SET latitude = 19.0760, longitude = 72.8777 WHERE LOWER(city) = 'mumbai' AND latitude IS NULL;
UPDATE hospitals SET latitude = 28.7041, longitude = 77.1025 WHERE LOWER(city) = 'delhi' AND latitude IS NULL;
UPDATE hospitals SET latitude = 12.9716, longitude = 77.5946 WHERE LOWER(city) = 'bangalore' AND latitude IS NULL;
UPDATE hospitals SET latitude = 13.0827, longitude = 80.2707 WHERE LOWER(city) = 'chennai' AND latitude IS NULL;
UPDATE hospitals SET latitude = 22.5726, longitude = 88.3639 WHERE LOWER(city) = 'kolkata' AND latitude IS NULL;
UPDATE hospitals SET latitude = 17.3850, longitude = 78.4867 WHERE LOWER(city) = 'hyderabad' AND latitude IS NULL;
UPDATE hospitals SET latitude = 18.5204, longitude = 73.8567 WHERE LOWER(city) = 'pune' AND latitude IS NULL;
UPDATE hospitals SET latitude = 26.9124, longitude = 75.7873 WHERE LOWER(city) = 'jaipur' AND latitude IS NULL;
UPDATE hospitals SET latitude = 25.5941, longitude = 85.1376 WHERE LOWER(city) = 'patna' AND latitude IS NULL;
UPDATE hospitals SET latitude = 23.2599, longitude = 77.4126 WHERE LOWER(city) = 'bhopal' AND latitude IS NULL;
UPDATE hospitals SET latitude = 21.1458, longitude = 79.0882 WHERE LOWER(city) = 'nagpur' AND latitude IS NULL;
UPDATE hospitals SET latitude = 26.8467, longitude = 80.9462 WHERE LOWER(city) = 'lucknow' AND latitude IS NULL;
UPDATE hospitals SET latitude = 30.7333, longitude = 76.7794 WHERE LOWER(city) = 'chandigarh' AND latitude IS NULL;
UPDATE hospitals SET latitude = 20.2961, longitude = 85.8245 WHERE LOWER(city) = 'bhubaneswar' AND latitude IS NULL;
UPDATE hospitals SET latitude = 27.0238, longitude = 74.2179 WHERE LOWER(city) = 'ajmer' AND latitude IS NULL;
UPDATE hospitals SET latitude = 22.7196, longitude = 75.8577 WHERE LOWER(city) = 'indore' AND latitude IS NULL;
UPDATE hospitals SET latitude = 26.2183, longitude = 78.1828 WHERE LOWER(city) = 'gwalior' AND latitude IS NULL;
UPDATE hospitals SET latitude = 16.3067, longitude = 80.4365 WHERE LOWER(city) = 'guntur' AND latitude IS NULL;
