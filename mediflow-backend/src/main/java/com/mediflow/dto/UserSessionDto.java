package com.mediflow.dto;

import java.time.LocalDateTime;

public class UserSessionDto {
    private Long id;
    private LocalDateTime loginTime;
    private String deviceInfo;
    private String browserInfo;
    private boolean isCurrent;

    public UserSessionDto() {}

    public UserSessionDto(Long id, LocalDateTime loginTime, String deviceInfo, String browserInfo, boolean isCurrent) {
        this.id = id;
        this.loginTime = loginTime;
        this.deviceInfo = deviceInfo;
        this.browserInfo = browserInfo;
        this.isCurrent = isCurrent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public String getBrowserInfo() {
        return browserInfo;
    }

    public void setBrowserInfo(String browserInfo) {
        this.browserInfo = browserInfo;
    }

    public boolean isCurrent() {
        return isCurrent;
    }

    public void setCurrent(boolean current) {
        isCurrent = current;
    }
}
