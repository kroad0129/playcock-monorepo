package com.playcock.auth;

import com.playcock.auth.dto.LoginRequest;
import com.playcock.auth.dto.LoginResponse;
import com.playcock.global.enums.UserStatus;
import com.playcock.global.exception.InactiveUserException;
import com.playcock.global.exception.LoginFailedException;
import com.playcock.global.jwt.JwtProvider;
import com.playcock.user.User;
import com.playcock.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new LoginFailedException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new LoginFailedException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InactiveUserException("비활성화된 계정입니다.");
        }

        String accessToken = jwtProvider.createAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );

        return LoginResponse.of(accessToken);
    }
}