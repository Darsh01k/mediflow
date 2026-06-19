package com.mediflow.dto;

import com.mediflow.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotNull(message = "Role is required")
    private Role role;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    private LocalDate dateOfBirth;

    @Size(max = 20, message = "Gender must not exceed 20 characters")
    private String gender;

    @Pattern(regexp = "^[+]?[0-9\\s()-]{7,20}$", message = "Phone number is invalid")
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "Emergency contact must not exceed 100 characters")
    private String emergencyContact;

    @Size(max = 10, message = "Blood type must not exceed 10 characters")
    private String bloodType;

    // Doctor profile registration fields
    @Size(max = 100, message = "Specialization must not exceed 100 characters")
    private String specialization;

    @Size(max = 50, message = "License number must not exceed 50 characters")
    private String licenseNumber;

    private BigDecimal consultationFee;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    private Long hospitalId;

    @Size(max = 200, message = "Qualification must not exceed 200 characters")
    private String qualification;

    private Integer experience;

    @Size(max = 200, message = "Languages must not exceed 200 characters")
    private String languages;

    @Size(max = 50, message = "Avatar ID must not exceed 50 characters")
    private String avatarId;

    @Size(max = 500, message = "Availability must not exceed 500 characters")
    private String availability;

    // Hospital Admin registration fields (to create a Hospital upon registration)
    @Size(max = 200, message = "Hospital name must not exceed 200 characters")
    private String hospitalName;

    @Size(max = 100, message = "Hospital email must not exceed 100 characters")
    private String hospitalEmail;

    @Size(max = 20, message = "Hospital phone must not exceed 20 characters")
    private String hospitalPhone;

    @Size(max = 500, message = "Hospital address must not exceed 500 characters")
    private String hospitalAddress;

    @Size(max = 100, message = "Hospital city must not exceed 100 characters")
    private String hospitalCity;

    @Size(max = 100, message = "Hospital state must not exceed 100 characters")
    private String hospitalState;

    @Pattern(regexp = "^[0-9]{5,6}$", message = "Pincode must be 5 or 6 digits")
    private String hospitalPincode;

    private Double hospitalLatitude;
    private Double hospitalLongitude;

    @Size(max = 50, message = "Hospital license number must not exceed 50 characters")
    private String hospitalLicenseNumber;

    @Size(max = 2000, message = "Hospital description must not exceed 2000 characters")
    private String hospitalDescription;

    @Size(max = 50, message = "Hospital logo avatar must not exceed 50 characters")
    private String hospitalLogoAvatar;

    public RegisterRequest() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
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

    public String getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(String avatarId) {
        this.avatarId = avatarId;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getHospitalEmail() {
        return hospitalEmail;
    }

    public void setHospitalEmail(String hospitalEmail) {
        this.hospitalEmail = hospitalEmail;
    }

    public String getHospitalPhone() {
        return hospitalPhone;
    }

    public void setHospitalPhone(String hospitalPhone) {
        this.hospitalPhone = hospitalPhone;
    }

    public String getHospitalAddress() {
        return hospitalAddress;
    }

    public void setHospitalAddress(String hospitalAddress) {
        this.hospitalAddress = hospitalAddress;
    }

    public String getHospitalCity() {
        return hospitalCity;
    }

    public void setHospitalCity(String hospitalCity) {
        this.hospitalCity = hospitalCity;
    }

    public String getHospitalState() {
        return hospitalState;
    }

    public void setHospitalState(String hospitalState) {
        this.hospitalState = hospitalState;
    }

    public String getHospitalPincode() {
        return hospitalPincode;
    }

    public void setHospitalPincode(String hospitalPincode) {
        this.hospitalPincode = hospitalPincode;
    }

    public Double getHospitalLatitude() {
        return hospitalLatitude;
    }

    public void setHospitalLatitude(Double hospitalLatitude) {
        this.hospitalLatitude = hospitalLatitude;
    }

    public Double getHospitalLongitude() {
        return hospitalLongitude;
    }

    public void setHospitalLongitude(Double hospitalLongitude) {
        this.hospitalLongitude = hospitalLongitude;
    }

    public String getHospitalLicenseNumber() {
        return hospitalLicenseNumber;
    }

    public void setHospitalLicenseNumber(String hospitalLicenseNumber) {
        this.hospitalLicenseNumber = hospitalLicenseNumber;
    }

    public String getHospitalDescription() {
        return hospitalDescription;
    }

    public void setHospitalDescription(String hospitalDescription) {
        this.hospitalDescription = hospitalDescription;
    }

    public String getHospitalLogoAvatar() {
        return hospitalLogoAvatar;
    }

    public void setHospitalLogoAvatar(String hospitalLogoAvatar) {
        this.hospitalLogoAvatar = hospitalLogoAvatar;
    }

    private String city;
    private String state;
    private String country;

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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    private String hospitalType;
    private String hospitalFacilities;
    private Integer hospitalNumberOfBeds;
    private Boolean hospitalEmergencyServicesAvailable;
    private String hospitalWebsite;

    public String getHospitalType() {
        return hospitalType;
    }

    public void setHospitalType(String hospitalType) {
        this.hospitalType = hospitalType;
    }

    public String getHospitalFacilities() {
        return hospitalFacilities;
    }

    public void setHospitalFacilities(String hospitalFacilities) {
        this.hospitalFacilities = hospitalFacilities;
    }

    public Integer getHospitalNumberOfBeds() {
        return hospitalNumberOfBeds;
    }

    public void setHospitalNumberOfBeds(Integer hospitalNumberOfBeds) {
        this.hospitalNumberOfBeds = hospitalNumberOfBeds;
    }

    public Boolean getHospitalEmergencyServicesAvailable() {
        return hospitalEmergencyServicesAvailable;
    }

    public void setHospitalEmergencyServicesAvailable(Boolean hospitalEmergencyServicesAvailable) {
        this.hospitalEmergencyServicesAvailable = hospitalEmergencyServicesAvailable;
    }

    public String getHospitalWebsite() {
        return hospitalWebsite;
    }

    public void setHospitalWebsite(String hospitalWebsite) {
        this.hospitalWebsite = hospitalWebsite;
    }
}
