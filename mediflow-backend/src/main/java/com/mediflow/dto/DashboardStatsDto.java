package com.mediflow.dto;

import java.util.List;

public class DashboardStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long upcomingAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private List<AppointmentDto> recentAppointments;
    private List<MedicalRecordDto> recentRecords;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalPatients, long totalDoctors, long totalAppointments, long upcomingAppointments, long completedAppointments, long cancelledAppointments, List<AppointmentDto> recentAppointments, List<MedicalRecordDto> recentRecords) {
        this.totalPatients = totalPatients;
        this.totalDoctors = totalDoctors;
        this.totalAppointments = totalAppointments;
        this.upcomingAppointments = upcomingAppointments;
        this.completedAppointments = completedAppointments;
        this.cancelledAppointments = cancelledAppointments;
        this.recentAppointments = recentAppointments;
        this.recentRecords = recentRecords;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getUpcomingAppointments() {
        return upcomingAppointments;
    }

    public void setUpcomingAppointments(long upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }

    public long getCompletedAppointments() {
        return completedAppointments;
    }

    public void setCompletedAppointments(long completedAppointments) {
        this.completedAppointments = completedAppointments;
    }

    public long getCancelledAppointments() {
        return cancelledAppointments;
    }

    public void setCancelledAppointments(long cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }

    public List<AppointmentDto> getRecentAppointments() {
        return recentAppointments;
    }

    public void setRecentAppointments(List<AppointmentDto> recentAppointments) {
        this.recentAppointments = recentAppointments;
    }

    public List<MedicalRecordDto> getRecentRecords() {
        return recentRecords;
    }

    public void setRecentRecords(List<MedicalRecordDto> recentRecords) {
        this.recentRecords = recentRecords;
    }
}
