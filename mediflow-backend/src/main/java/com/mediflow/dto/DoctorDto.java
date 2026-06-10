package com.mediflow.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DoctorDto {
    private Long id;
    private UserDto user;
    private String specialization;
    private String licenseNumber;
    private BigDecimal consultationFee;
    private String bio;
    private LocalDateTime createdAt;

    public DoctorDto() {}

    public DoctorDto(Long id, UserDto user, String specialization, String licenseNumber, BigDecimal consultationFee, String bio, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
        this.consultationFee = consultationFee;
        this.bio = bio;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
