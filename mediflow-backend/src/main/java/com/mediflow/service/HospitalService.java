package com.mediflow.service;

import com.mediflow.dto.DoctorDto;
import com.mediflow.dto.HospitalDto;
import com.mediflow.dto.PatientDto;
import com.mediflow.entity.Doctor;
import com.mediflow.entity.DoctorStatus;
import com.mediflow.entity.Hospital;
import com.mediflow.entity.Patient;
import com.mediflow.entity.Appointment;
import com.mediflow.exception.BadRequestException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.AppointmentRepository;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.HospitalRepository;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class HospitalService {

    private static final Logger logger = LoggerFactory.getLogger(HospitalService.class);

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<HospitalDto> getAllHospitals() {
        logger.info("Fetching all registered hospitals list");
        List<HospitalDto> hospitals = hospitalRepository.findAll().stream()
                .map(h -> {
                    HospitalDto dto = DtoMapper.toDto(h);
                    dto.setDoctorCount(doctorRepository.findByHospitalIdAndStatus(h.getId(), DoctorStatus.APPROVED).size());
                    return dto;
                })
                .collect(Collectors.toList());
        logger.info("Retrieved {} hospitals", hospitals.size());
        return hospitals;
    }

    public HospitalDto getHospitalById(Long id) {
        logger.info("Fetching hospital details for hospital ID: {}", id);
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Hospital not found with ID: {}", id);
                    return new ResourceNotFoundException("Hospital not found with id: " + id);
                });
        HospitalDto dto = DtoMapper.toDto(hospital);
        dto.setDoctorCount(doctorRepository.findByHospitalIdAndStatus(id, DoctorStatus.APPROVED).size());
        return dto;
    }

    @Transactional
    public HospitalDto updateHospital(Long id, HospitalDto hospitalDto) {
        logger.info("Updating details for hospital ID: {}", id);
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Update failed: Hospital not found with ID: {}", id);
                    return new ResourceNotFoundException("Hospital not found with id: " + id);
                });

        hospital.setName(hospitalDto.getName());
        hospital.setEmail(hospitalDto.getEmail());
        hospital.setPhone(hospitalDto.getPhone());
        hospital.setAddress(hospitalDto.getAddress());
        hospital.setCity(hospitalDto.getCity());
        hospital.setState(hospitalDto.getState());
        hospital.setPincode(hospitalDto.getPincode());
        hospital.setLatitude(hospitalDto.getLatitude());
        hospital.setLongitude(hospitalDto.getLongitude());
        hospital.setLicenseNumber(hospitalDto.getLicenseNumber());
        hospital.setDescription(hospitalDto.getDescription());
        if (hospitalDto.getLogoAvatar() != null) {
            hospital.setLogoAvatar(hospitalDto.getLogoAvatar());
        }

        Hospital updatedHospital = hospitalRepository.save(hospital);
        logger.info("Hospital profile for ID: {} successfully updated", id);
        HospitalDto dto = DtoMapper.toDto(updatedHospital);
        dto.setDoctorCount(doctorRepository.findByHospitalIdAndStatus(id, DoctorStatus.APPROVED).size());
        return dto;
    }

    public List<HospitalDto> searchHospitals(String name, String city, String state, String specialty, Double lat, Double lng) {
        logger.info("Searching hospitals with name: {}, city: {}, state: {}, specialty: {}, lat: {}, lng: {}", 
                name, city, state, specialty, lat, lng);

        String nameParam = (name == null || name.trim().isEmpty()) ? null : "%" + name.trim().toLowerCase() + "%";
        String cityParam = (city == null || city.trim().isEmpty()) ? null : "%" + city.trim().toLowerCase() + "%";
        String stateParam = (state == null || state.trim().isEmpty()) ? null : "%" + state.trim().toLowerCase() + "%";
        String specParam = (specialty == null || specialty.trim().isEmpty()) ? null : "%" + specialty.trim().toLowerCase() + "%";

        List<Hospital> hospitals = hospitalRepository.searchHospitals(nameParam, cityParam, stateParam, specParam);
        
        List<HospitalDto> dtos = hospitals.stream()
                .map(h -> {
                    HospitalDto dto = DtoMapper.toDto(h);
                    dto.setDoctorCount(doctorRepository.findByHospitalIdAndStatus(h.getId(), DoctorStatus.APPROVED).size());
                    if (lat != null && lng != null && h.getLatitude() != null && h.getLongitude() != null) {
                        double dist = calculateDistance(lat, lng, h.getLatitude(), h.getLongitude());
                        // round to 2 decimal places
                        dto.setDistance(Math.round(dist * 100.0) / 100.0);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        if (lat != null && lng != null) {
            dtos.sort((h1, h2) -> {
                if (h1.getDistance() == null) return 1;
                if (h2.getDistance() == null) return -1;
                return h1.getDistance().compareTo(h2.getDistance());
            });
        }
        
        logger.info("Hospital search returned {} results", dtos.size());
        return dtos;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    public List<DoctorDto> getDoctorsByHospital(Long hospitalId) {
        logger.info("Fetching doctors list for hospital ID: {}", hospitalId);
        return doctorRepository.findByHospitalId(hospitalId).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorDto updateDoctorStatus(Long hospitalId, Long doctorId, DoctorStatus status) {
        logger.info("Updating status to {} for doctor ID: {} at hospital ID: {}", status, doctorId, hospitalId);
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> {
                    logger.error("Status update failed: Doctor not found with ID: {}", doctorId);
                    return new ResourceNotFoundException("Doctor not found with id: " + doctorId);
                });

        if (doctor.getHospital() == null || !doctor.getHospital().getId().equals(hospitalId)) {
            logger.warn("Status update failed: Doctor with ID: {} does not belong to hospital ID: {}", doctorId, hospitalId);
            throw new BadRequestException("Doctor does not belong to this hospital");
        }

        doctor.setStatus(status);
        Doctor updatedDoctor = doctorRepository.save(doctor);
        logger.info("Doctor ID: {} status successfully updated to {}", doctorId, status);
        return DtoMapper.toDto(updatedDoctor);
    }

    public List<PatientDto> getPatientsByHospital(Long hospitalId) {
        logger.info("Fetching treated patients list for hospital ID: {}", hospitalId);
        List<Appointment> appointments = appointmentRepository.findByDoctorHospitalId(hospitalId);
        return appointments.stream()
                .map(Appointment::getPatient)
                .distinct()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }
}
