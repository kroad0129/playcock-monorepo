package com.playcock.session.repository;

import com.playcock.session.domain.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findAllByOrderByStartedAtDesc();
}