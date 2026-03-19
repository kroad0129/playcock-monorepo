package com.playcock.user.dto;

import com.playcock.global.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UserRoleUpdateRequest {

    @NotNull
    private UserRole role;
}