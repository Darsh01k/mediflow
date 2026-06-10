package com.mediflow.service;

import com.mediflow.dto.DoctorDto;
import com.mediflow.dto.UserDto;
import com.mediflow.entity.Doctor;
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

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return DtoMapper.toDto(doctor);
    }

    public DoctorDto getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for user id: " + userId));
        return DtoMapper.toDto(doctor);
    }

    @Transactional
    public DoctorDto updateDoctor(Long id, DoctorDto doctorDto) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));

        doctor.setSpecialization(doctorDto.getSpecialization());
        doctor.setLicenseNumber(doctorDto.getLicenseNumber());
        doctor.setConsultationFee(doctorDto.getConsultationFee());
        doctor.setBio(doctorDto.getBio());

        if (doctorDto.getUser() != null) {
            User user = doctor.getUser();
            UserDto userDto = doctorDto.getUser();
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
            user.setEmail(userDto.getEmail());
            userRepository.save(user);
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return DtoMapper.toDto(updatedDoctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        
        doctorRepository.delete(doctor);
    }

    public List<String> getSpecializations() {
        return doctorRepository.findAll().stream()
                .map(Doctor::getSpecialization)
                .distinct()
                .collect(Collectors.toList());
    }
}
