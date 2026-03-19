package com.playcock.session.repository;

import com.playcock.global.enums.SessionParticipantStatus;
import com.playcock.member.Member;
import com.playcock.session.domain.Session;
import com.playcock.session.domain.SessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, Long> {

    List<SessionParticipant> findBySession(Session session);

    List<SessionParticipant> findBySessionAndStatusNot(Session session, SessionParticipantStatus status);

    boolean existsBySessionAndMember(Session session, Member member);

    Optional<SessionParticipant> findBySessionAndMember(Session session, Member member);

    List<SessionParticipant> findBySessionAndStatus(Session session, SessionParticipantStatus status);
}