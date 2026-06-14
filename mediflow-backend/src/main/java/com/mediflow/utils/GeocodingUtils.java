package com.mediflow.utils;

import java.util.HashMap;
import java.util.Map;

public class GeocodingUtils {

    public static class Coordinates {
        private final double latitude;
        private final double longitude;

        public Coordinates(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public double getLatitude() {
            return latitude;
        }

        public double getLongitude() {
            return longitude;
        }
    }

    private static final Map<String, Coordinates> CITY_COORDINATES = new HashMap<>();

    static {
        CITY_COORDINATES.put("ahmedabad", new Coordinates(23.0225, 72.5714));
        CITY_COORDINATES.put("surat", new Coordinates(21.1702, 72.8311));
        CITY_COORDINATES.put("rajkot", new Coordinates(22.3039, 70.8022));
        CITY_COORDINATES.put("vadodara", new Coordinates(22.3072, 73.1812));
        CITY_COORDINATES.put("mumbai", new Coordinates(19.0760, 72.8777));
        CITY_COORDINATES.put("delhi", new Coordinates(28.7041, 77.1025));
    }

    public static Coordinates geocode(String city) {
        if (city == null || city.trim().isEmpty()) {
            return null;
        }
        return CITY_COORDINATES.get(city.trim().toLowerCase());
    }
}
