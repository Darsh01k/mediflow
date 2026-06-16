package com.mediflow.repository;

import com.mediflow.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByToken(String token);
    List<UserSession> findByUserIdAndIsActiveTrue(Long userId);
    Optional<UserSession> findByUserIdAndDeviceInfoAndBrowserInfoAndIsActiveTrue(Long userId, String deviceInfo, String browserInfo);
    Optional<UserSession> findByUserIdAndBrowserInfoAndDeviceFingerprintAndIsActiveTrue(Long userId, String browserInfo, String deviceFingerprint);
}
