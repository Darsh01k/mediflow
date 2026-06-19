package com.mediflow.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PrescriptionDto {
    private Long id;
    private PatientDto patient;
    private DoctorDto doctor;
    private HospitalDto hospital;
    private LocalDate prescriptionDate;
    private String medicinesJson;
    private String dosage;
    private String instructions;
    private String notes;
    private LocalDateTime createdAt;

    public PrescriptionDto() {}

    public PrescriptionDto(Long id, PatientDto patient, DoctorDto doctor, HospitalDto hospital, LocalDate prescriptionDate, String medicinesJson, String dosage, String instructions, String notes, LocalDateTime createdAt) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.hospital = hospital;
        this.prescriptionDate = prescriptionDate;
        this.medicinesJson = medicinesJson;
        this.dosage = dosage;
        this.instructions = instructions;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PatientDto getPatient() {
        return patient;
    }

    public void setPatient(PatientDto patient) {
        this.patient = patient;
    }

    public DoctorDto getDoctor() {
        return doctor;
    }

    public void setDoctor(DoctorDto doctor) {
        this.doctor = doctor;
    }

    public HospitalDto getHospital() {
        return hospital;
    }

    public void setHospital(HospitalDto hospital) {
        this.hospital = hospital;
    }

    public LocalDate getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDate prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public String getMedicinesJson() {
        return medicinesJson;
    }

    public void setMedicinesJson(String medicinesJson) {
        this.medicinesJson = medicinesJson;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
