package com.mediflow.service;

import com.mediflow.dto.NotificationDto;
import com.mediflow.entity.Notification;
import com.mediflow.entity.User;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.NotificationRepository;
import com.mediflow.utils.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public NotificationDto createNotification(User user, String message) {
        Notification notification = new Notification(user, message);
        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = DtoMapper.toDto(saved);

        // Send real-time notification via STOMP WebSocket
        // The client subscribes to /user/{userId}/notifications
        messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/notifications",
                dto
        );

        return dto;
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false).stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    @Transactional
    public NotificationDto markAsRead(Long id, Long authenticatedUserId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        if (!notification.getUser().getId().equals(authenticatedUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized access to notification.");
        }
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return DtoMapper.toDto(saved);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
