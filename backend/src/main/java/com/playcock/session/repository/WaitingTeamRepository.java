package com.playcock.session.repository;

import com.playcock.session.domain.Session;
import com.playcock.session.domain.WaitingTeam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaitingTeamRepository extends JpaRepository<WaitingTeam, Long> {

    List<WaitingTeam> findBySession(Session session);

    List<WaitingTeam> findBySessionOrderByQueueOrderAsc(Session session);

    Optional<WaitingTeam> findTopBySessionOrderByQueueOrderDesc(Session session);

    boolean existsBySession(Session session);
}