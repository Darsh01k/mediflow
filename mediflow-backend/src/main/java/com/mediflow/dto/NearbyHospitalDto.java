package com.mediflow.dto;

public class NearbyHospitalDto {
    private Long hospitalId;
    private String name;
    private Double distanceKm;

    public NearbyHospitalDto() {}

    public NearbyHospitalDto(Long hospitalId, String name, Double distanceKm) {
        this.hospitalId = hospitalId;
        this.name = name;
        this.distanceKm = distanceKm;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }
}
