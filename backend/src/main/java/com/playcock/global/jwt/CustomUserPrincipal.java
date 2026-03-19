package com.playcock.global.jwt;

import com.playcock.global.enums.UserRole;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Getter
public class CustomUserPrincipal {

    private final Long userId;
    private final String email;
    private final UserRole role;

    public CustomUserPrincipal(Long userId, String email, UserRole role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
}