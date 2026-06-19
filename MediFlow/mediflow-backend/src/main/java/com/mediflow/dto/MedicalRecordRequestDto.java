package com.mediflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MedicalRecordRequestDto {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotBlank(message = "Diagnosis is required")
    @Size(max = 5000, message = "Diagnosis must not exceed 5000 characters")
    private String diagnosis;

    @NotBlank(message = "Prescription is required")
    @Size(max = 5000, message = "Prescription must not exceed 5000 characters")
    private String prescription;

    @Size(max = 5000, message = "Treatment notes must not exceed 5000 characters")
    private String treatmentNotes;

    @Size(max = 10000, message = "Medicines JSON must not exceed 10000 characters")
    private String medicinesJson;

    @Size(max = 2000, message = "Dosage must not exceed 2000 characters")
    private String dosage;

    @Size(max = 2000, message = "Instructions must not exceed 2000 characters")
    private String instructions;

    public MedicalRecordRequestDto() {}

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

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public String getTreatmentNotes() {
        return treatmentNotes;
    }

    public void setTreatmentNotes(String treatmentNotes) {
        this.treatmentNotes = treatmentNotes;
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
}
