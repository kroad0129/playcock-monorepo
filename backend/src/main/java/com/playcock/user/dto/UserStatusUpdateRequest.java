package com.playcock.user.dto;

import com.playcock.global.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserStatusUpdateRequest {

    @NotNull(message = "상태값은 필수입니다.")
    private UserStatus status;
}