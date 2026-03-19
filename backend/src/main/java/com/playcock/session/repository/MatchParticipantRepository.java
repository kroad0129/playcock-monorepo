package com.playcock.session.repository;

import com.playcock.session.domain.Match;
import com.playcock.session.domain.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {
    List<MatchParticipant> findByMatch(Match match);
}