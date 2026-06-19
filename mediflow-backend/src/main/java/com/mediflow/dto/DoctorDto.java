package com.mediflow.dto;

import com.mediflow.entity.DoctorStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DoctorDto {
    private Long id;
    private UserDto user;
    private String specialization;
    private String licenseNumber;
    private BigDecimal consultationFee;
    private String bio;
    private String phone;
    private String qualification;
    private Integer experience;
    private String languages;
    private String availability;
    private DoctorStatus status;
    private HospitalDto hospital;
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

    public DoctorDto(Long id, UserDto user, String specialization, String licenseNumber, BigDecimal consultationFee, String bio, String phone, String qualification, Integer experience, String languages, String availability, DoctorStatus status, HospitalDto hospital, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
        this.consultationFee = consultationFee;
        this.bio = bio;
        this.phone = phone;
        this.qualification = qualification;
        this.experience = experience;
        this.languages = languages;
        this.availability = availability;
        this.status = status;
        this.hospital = hospital;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public DoctorStatus getStatus() {
        return status;
    }

    public void setStatus(DoctorStatus status) {
        this.status = status;
    }

    public HospitalDto getHospital() {
        return hospital;
    }

    public void setHospital(HospitalDto hospital) {
        this.hospital = hospital;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
