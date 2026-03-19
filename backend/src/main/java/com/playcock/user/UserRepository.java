package com.playcock.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmailAndDeletedAtIsNull(String email);
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
}