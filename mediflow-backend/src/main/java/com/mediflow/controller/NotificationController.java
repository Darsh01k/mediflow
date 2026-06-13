package com.mediflow.controller;

import com.mediflow.config.UserDetailsImpl;
import com.mediflow.dto.NotificationDto;
import com.mediflow.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        List<NotificationDto> notifications = notificationService.getUserNotifications(userPrincipal.getId());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        long count = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        NotificationDto dto = notificationService.markAsRead(id, userPrincipal.getId());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}
