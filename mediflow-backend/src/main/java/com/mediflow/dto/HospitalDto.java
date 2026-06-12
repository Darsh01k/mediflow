package com.mediflow.dto;

import java.time.LocalDateTime;

public class HospitalDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String licenseNumber;
    private String description;
    private String logoAvatar;
    private LocalDateTime createdAt;
    private Integer doctorCount;
    private Double distance;

    public HospitalDto() {}

    public HospitalDto(Long id, String name, String email, String phone, String address, String city, String state, String pincode, Double latitude, Double longitude, String licenseNumber, String description, String logoAvatar, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.licenseNumber = licenseNumber;
        this.description = description;
        this.logoAvatar = logoAvatar;
        this.createdAt = createdAt;
    }

    public HospitalDto(Long id, String name, String email, String phone, String address, String city, String state, String pincode, Double latitude, Double longitude, String licenseNumber, String description, String logoAvatar, LocalDateTime createdAt, Integer doctorCount, Double distance) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.licenseNumber = licenseNumber;
        this.description = description;
        this.logoAvatar = logoAvatar;
        this.createdAt = createdAt;
        this.doctorCount = doctorCount;
        this.distance = distance;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoAvatar() {
        return logoAvatar;
    }

    public void setLogoAvatar(String logoAvatar) {
        this.logoAvatar = logoAvatar;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getDoctorCount() {
        return doctorCount;
    }

    public void setDoctorCount(Integer doctorCount) {
        this.doctorCount = doctorCount;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }
}
