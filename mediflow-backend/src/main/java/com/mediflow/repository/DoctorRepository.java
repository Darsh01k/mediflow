package com.mediflow.repository;

import com.mediflow.entity.Doctor;
import com.mediflow.entity.User;
import com.mediflow.entity.DoctorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByLicenseNumber(String licenseNumber);
    List<Doctor> findByStatus(DoctorStatus status);
    List<Doctor> findByHospitalId(Long hospitalId);
    List<Doctor> findByHospitalIdAndStatus(Long hospitalId, DoctorStatus status);

    @Query("SELECT d FROM Doctor d WHERE d.status = 'APPROVED' AND " +
           "(:name IS NULL OR TRIM(:name) = '' OR LOWER(TRIM(CONCAT(d.user.firstName, ' ', d.user.lastName))) LIKE LOWER(CONCAT('%', TRIM(:name), '%')) OR LOWER(TRIM(d.user.username)) LIKE LOWER(CONCAT('%', TRIM(:name), '%'))) AND " +
           "(:specialization IS NULL OR TRIM(:specialization) = '' OR LOWER(TRIM(d.specialization)) LIKE LOWER(CONCAT('%', TRIM(:specialization), '%'))) AND " +
           "(:hospital IS NULL OR TRIM(:hospital) = '' OR LOWER(TRIM(d.hospital.name)) LIKE LOWER(CONCAT('%', TRIM(:hospital), '%'))) AND " +
           "(:city IS NULL OR TRIM(:city) = '' OR LOWER(TRIM(d.hospital.city)) LIKE LOWER(CONCAT('%', TRIM(:city), '%'))) AND " +
           "(:experience IS NULL OR d.experience >= :experience)")
    List<Doctor> searchDoctors(
        @Param("name") String name,
        @Param("specialization") String specialization,
        @Param("hospital") String hospital,
        @Param("city") String city,
        @Param("experience") Integer experience
    );
}
