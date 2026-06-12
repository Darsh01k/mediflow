package com.mediflow.dto;

import java.time.LocalDateTime;

public class TimelineItemDto {
    private String type; // "APPOINTMENT", "PRESCRIPTION", "VISIT"
    private Long id;
    private LocalDateTime date;
    private String title;
    private String subtitle;
    private String details;
    private String status;

    public TimelineItemDto() {}

    public TimelineItemDto(String type, Long id, LocalDateTime date, String title, String subtitle, String details, String status) {
        this.type = type;
        this.id = id;
        this.date = date;
        this.title = title;
        this.subtitle = subtitle;
        this.details = details;
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
