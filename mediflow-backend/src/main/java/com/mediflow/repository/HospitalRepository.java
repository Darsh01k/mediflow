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
           "WHERE (:name IS NULL OR :name = '' OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:city IS NULL OR :city = '' OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:state IS NULL OR :state = '' OR LOWER(h.state) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
           "(:specialty IS NULL OR :specialty = '' OR (d.status = 'APPROVED' AND LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialty, '%'))))")
    List<Hospital> searchHospitals(
        @Param("name") String name,
        @Param("city") String city,
        @Param("state") String state,
        @Param("specialty") String specialty
    );
}
