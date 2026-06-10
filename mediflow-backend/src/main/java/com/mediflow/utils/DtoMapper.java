package com.mediflow.utils;

import com.mediflow.dto.*;
import com.mediflow.entity.*;

public class DtoMapper {

    public static UserDto toDto(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    public static PatientDto toDto(Patient patient) {
        if (patient == null) return null;
        return new PatientDto(
                patient.getId(),
                toDto(patient.getUser()),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getEmergencyContact(),
                patient.getBloodType(),
                patient.getCreatedAt()
        );
    }

    public static DoctorDto toDto(Doctor doctor) {
        if (doctor == null) return null;
        return new DoctorDto(
                doctor.getId(),
                toDto(doctor.getUser()),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getConsultationFee(),
                doctor.getBio(),
                doctor.getCreatedAt()
        );
    }

    public static AppointmentDto toDto(Appointment appointment) {
        if (appointment == null) return null;
        return new AppointmentDto(
                appointment.getId(),
                toDto(appointment.getPatient()),
                toDto(appointment.getDoctor()),
                appointment.getAppointmentDate(),
                appointment.getStatus(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }

    public static MedicalRecordDto toDto(MedicalRecord record) {
        if (record == null) return null;
        return new MedicalRecordDto(
                record.getId(),
                toDto(record.getPatient()),
                toDto(record.getDoctor()),
                record.getDiagnosis(),
                record.getPrescription(),
                record.getTreatmentNotes(),
                record.getVisitDate(),
                record.getCreatedAt()
        );
    }
}
