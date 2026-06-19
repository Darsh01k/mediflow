package com.mediflow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class PrescriptionRequestDto {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Prescription date is required")
    private LocalDate prescriptionDate;

    @Size(max = 10000, message = "Medicines JSON must not exceed 10000 characters")
    private String medicinesJson;

    @Size(max = 2000, message = "Dosage must not exceed 2000 characters")
    private String dosage;

    @Size(max = 2000, message = "Instructions must not exceed 2000 characters")
    private String instructions;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    public PrescriptionRequestDto() {}

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
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
}
