package com.mediflow.repository;

import com.mediflow.entity.Doctor;
import com.mediflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByLicenseNumber(String licenseNumber);
}
