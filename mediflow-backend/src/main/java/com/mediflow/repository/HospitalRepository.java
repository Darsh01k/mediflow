package com.mediflow.repository;

import com.mediflow.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    @Query("SELECT DISTINCT h FROM Hospital h LEFT JOIN Doctor d ON d.hospital = h " +
           "WHERE (:name IS NULL OR TRIM(:name) = '' OR LOWER(TRIM(h.name)) LIKE LOWER(CONCAT('%', TRIM(:name), '%'))) AND " +
           "(:city IS NULL OR TRIM(:city) = '' OR LOWER(TRIM(h.city)) LIKE LOWER(CONCAT('%', TRIM(:city), '%'))) AND " +
           "(:state IS NULL OR TRIM(:state) = '' OR LOWER(TRIM(h.state)) LIKE LOWER(CONCAT('%', TRIM(:state), '%'))) AND " +
           "(:specialty IS NULL OR TRIM(:specialty) = '' OR (d.status = 'APPROVED' AND LOWER(TRIM(d.specialization)) LIKE LOWER(CONCAT('%', TRIM(:specialty), '%'))))")
    List<Hospital> searchHospitals(
        @Param("name") String name,
        @Param("city") String city,
        @Param("state") String state,
        @Param("specialty") String specialty
    );
}
