package com.mediflow.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientDto {
    private Long id;
    private UserDto user;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String address;
    private String emergencyContact;
    private String bloodType;
    private String medicalNotes;
    private LocalDateTime createdAt;

    public PatientDto() {}

    public PatientDto(Long id, UserDto user, LocalDate dateOfBirth, String gender, String phone, String address, String emergencyContact, String bloodType, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
        this.address = address;
        this.emergencyContact = emergencyContact;
        this.bloodType = bloodType;
        this.createdAt = createdAt;
    }

    public PatientDto(Long id, UserDto user, LocalDate dateOfBirth, String gender, String phone, String address, String emergencyContact, String bloodType, String medicalNotes, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
        this.address = address;
        this.emergencyContact = emergencyContact;
        this.bloodType = bloodType;
        this.medicalNotes = medicalNotes;
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

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
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

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public String getMedicalNotes() {
        return medicalNotes;
    }

    public void setMedicalNotes(String medicalNotes) {
        this.medicalNotes = medicalNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
