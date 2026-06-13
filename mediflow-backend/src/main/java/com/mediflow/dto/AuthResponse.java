package com.mediflow.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Long profileId;
    private String firstName;
    private String lastName;
    private String avatarId;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String username, String email, String role, Long profileId) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.profileId = profileId;
    }

    public AuthResponse(String token, Long userId, String username, String email, String role, Long profileId, String firstName, String lastName, String avatarId) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.profileId = profileId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatarId = avatarId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(String avatarId) {
        this.avatarId = avatarId;
    }
}

