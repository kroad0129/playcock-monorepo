package com.playcock.user;

import com.playcock.global.enums.UserRole;
import com.playcock.global.enums.UserStatus;
import com.playcock.global.exception.DuplicateEmailException;
import com.playcock.user.dto.UserCreateRequest;
import com.playcock.user.dto.UserCreateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserCreateResponse createUser(UserCreateRequest request) {
        validateDuplicateEmail(request.getEmail());

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .name(request.getName())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        return UserCreateResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public UserCreateResponse getMyInfo(Long userId) {
        User user = findActiveUser(userId);
        return UserCreateResponse.from(user);
    }

    public void updateUserRole(Long userId, UserRole role) {
        User user = findActiveUser(userId);
        user.changeRole(role);
    }

    public void updateUserStatus(Long userId, UserStatus status) {
        User user = findActiveUser(userId);
        user.changeStatus(status);
    }

    public void deleteUser(Long userId) {
        User user = findActiveUser(userId);
        user.softDelete();
    }

    private void validateDuplicateEmail(String email) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new DuplicateEmailException("이미 존재하는 이메일입니다.");
        }
    }

    private User findActiveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        if (user.isDeleted()) {
            throw new IllegalArgumentException("삭제된 사용자입니다. id=" + userId);
        }

        return user;
    }

}