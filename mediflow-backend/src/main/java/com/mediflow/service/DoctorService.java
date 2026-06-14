package com.mediflow.service;

import com.mediflow.dto.DoctorDto;
import com.mediflow.dto.UserDto;
import com.mediflow.entity.Doctor;
import com.mediflow.entity.DoctorStatus;
import com.mediflow.entity.User;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.UserRepository;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class DoctorService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    public List<DoctorDto> getAllDoctors() {
        logger.info("Fetching all approved doctors list");
        List<DoctorDto> doctors = doctorRepository.findByStatus(DoctorStatus.APPROVED).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
        logger.info("Retrieved {} approved doctors", doctors.size());
        return doctors;
    }

    public DoctorDto getDoctorById(Long id) {
        logger.info("Fetching doctor details for doctor ID: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Doctor profile not found with ID: {}", id);
                    return new ResourceNotFoundException("Doctor not found with id: " + id);
                });
        return DtoMapper.toDto(doctor);
    }

    public DoctorDto getDoctorByUserId(Long userId) {
        logger.info("Fetching doctor details for user ID: {}", userId);
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    logger.error("Doctor profile not found for user ID: {}", userId);
                    return new ResourceNotFoundException("Doctor not found for user id: " + userId);
                });
        return DtoMapper.toDto(doctor);
    }

    @Transactional
    public DoctorDto updateDoctor(Long id, DoctorDto doctorDto) {
        logger.info("Updating doctor details for doctor ID: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Failed to update: Doctor not found with ID: {}", id);
                    return new ResourceNotFoundException("Doctor not found with id: " + id);
                });

        doctor.setSpecialization(doctorDto.getSpecialization());
        doctor.setLicenseNumber(doctorDto.getLicenseNumber());
        doctor.setConsultationFee(doctorDto.getConsultationFee());
        doctor.setBio(doctorDto.getBio());
        doctor.setPhone(doctorDto.getPhone());
        doctor.setQualification(doctorDto.getQualification());
        doctor.setExperience(doctorDto.getExperience());
        doctor.setLanguages(doctorDto.getLanguages());
        doctor.setAvailability(doctorDto.getAvailability());

        if (doctorDto.getUser() != null) {
            User user = doctor.getUser();
            UserDto userDto = doctorDto.getUser();
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
            user.setEmail(userDto.getEmail());
            if (userDto.getAvatarId() != null) {
                user.setAvatarId(userDto.getAvatarId());
            }
            userRepository.save(user);
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);
        logger.info("Doctor profile with ID: {} successfully updated", id);
        return DtoMapper.toDto(updatedDoctor);
    }

    public List<DoctorDto> searchDoctors(String name, String specialization, String hospital, String city, Integer experience) {
        logger.info("Searching doctors by name: {}, specialization: {}, hospital: {}, city: {}, experience: {}", 
                name, specialization, hospital, city, experience);
        
        String nameParam = (name == null || name.trim().isEmpty()) ? null : "%" + name.trim().toLowerCase() + "%";
        String specParam = (specialization == null || specialization.trim().isEmpty()) ? null : "%" + specialization.trim().toLowerCase() + "%";
        String hospParam = (hospital == null || hospital.trim().isEmpty()) ? null : "%" + hospital.trim().toLowerCase() + "%";
        String cityParam = (city == null || city.trim().isEmpty()) ? null : "%" + city.trim().toLowerCase() + "%";

        List<DoctorDto> doctors = doctorRepository.searchDoctors(nameParam, specParam, hospParam, cityParam, experience).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
        logger.info("Doctor search returned {} results", doctors.size());
        return doctors;
    }

    @Transactional
    public void deleteDoctor(Long id) {
        logger.info("Attempting to delete doctor with ID: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Delete failed: Doctor not found with ID: {}", id);
                    return new ResourceNotFoundException("Doctor not found with id: " + id);
                });
        
        doctorRepository.delete(doctor);
        logger.info("Successfully deleted doctor with ID: {}", id);
    }

    public List<String> getSpecializations() {
        logger.info("Fetching distinct specializations of approved doctors");
        return doctorRepository.findByStatus(DoctorStatus.APPROVED).stream()
                .map(Doctor::getSpecialization)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<DoctorDto> getApprovedDoctorsByHospital(Long hospitalId) {
        logger.info("Fetching approved doctors for hospital ID: {}", hospitalId);
        return doctorRepository.findByHospitalIdAndStatus(hospitalId, DoctorStatus.APPROVED).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<String> getSpecializationsByHospital(Long hospitalId) {
        logger.info("Fetching distinct specializations of approved doctors for hospital ID: {}", hospitalId);
        return doctorRepository.findByHospitalIdAndStatus(hospitalId, DoctorStatus.APPROVED).stream()
                .map(Doctor::getSpecialization)
                .distinct()
                .collect(Collectors.toList());
    }
}
