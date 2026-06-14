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
           "WHERE (:name IS NULL OR LOWER(h.name) LIKE :name) AND " +
           "(:city IS NULL OR LOWER(h.city) LIKE :city) AND " +
           "(:state IS NULL OR LOWER(h.state) LIKE :state) AND " +
           "(:specialty IS NULL OR (d.status = com.mediflow.entity.DoctorStatus.APPROVED AND LOWER(d.specialization) LIKE :specialty))")
    List<Hospital> searchHospitals(
        @Param("name") String name,
        @Param("city") String city,
        @Param("state") String state,
        @Param("specialty") String specialty
    );
}
