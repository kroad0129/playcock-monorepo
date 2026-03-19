package com.playcock.session.repository;

import com.playcock.global.enums.MatchStatus;
import com.playcock.session.domain.Match;
import com.playcock.session.domain.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findBySession(Session session);

    List<Match> findBySessionOrderByMatchNumberDesc(Session session);

    Optional<Match> findTopBySessionOrderByMatchNumberDesc(Session session);

    boolean existsBySessionAndStatus(Session session, MatchStatus status);

    List<Match> findBySessionAndStatusOrderByMatchNumberDesc(Session session, MatchStatus status);
}