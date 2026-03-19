package com.playcock.user.dto;

import com.playcock.global.enums.UserRole;
import com.playcock.global.enums.UserStatus;
import com.playcock.user.User;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserCreateResponse {

    private final Long id;
    private final String email;
    private final String name;
    private final UserRole role;
    private final UserStatus status;

    @Builder
    public UserCreateResponse(Long id, String email, String name, UserRole role, UserStatus status) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.status = status;
    }

    public static UserCreateResponse from(User user) {
        return UserCreateResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}