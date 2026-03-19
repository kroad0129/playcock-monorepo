package com.playcock.user;

import com.playcock.global.jwt.CustomUserPrincipal;
import com.playcock.global.response.ApiResponse;
import com.playcock.user.dto.UserCreateRequest;
import com.playcock.user.dto.UserCreateResponse;
import com.playcock.user.dto.UserRoleUpdateRequest;
import com.playcock.user.dto.UserStatusUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User", description = "사용자 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserCreateResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserCreateResponse response = userService.createUser(request);
        return ApiResponse.success(HttpStatus.CREATED.value(), "회원가입 성공", response);
    }

    @Operation(summary = "내 정보 조회")
    @GetMapping("/me")
    public ApiResponse<UserCreateResponse> getMyInfo(
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        UserCreateResponse response = userService.getMyInfo(principal.getUserId());
        return ApiResponse.success(200, "내 정보 조회 성공", response);
    }

    @Operation(summary = "유저 권한 변경 (관리자)")
    @PatchMapping("/{userId}/role")
    public ApiResponse<Void> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequest request
    ) {
        userService.updateUserRole(userId, request.getRole());
        return ApiResponse.success(200, "권한 변경 성공", null);
    }

    @Operation(summary = "유저 상태 변경")
    @PatchMapping("/{userId}/status")
    public ApiResponse<Void> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        userService.updateUserStatus(userId, request.getStatus());
        return ApiResponse.success(HttpStatus.OK.value(), "상태 변경 성공", null);
    }

    @Operation(summary = "유저 삭제")
    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ApiResponse.success(HttpStatus.NO_CONTENT.value(), "유저 삭제 성공", null);
    }
}