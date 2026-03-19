package com.playcock.session.repository;

import com.playcock.session.domain.WaitingTeam;
import com.playcock.session.domain.WaitingTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaitingTeamMemberRepository extends JpaRepository<WaitingTeamMember, Long> {

    List<WaitingTeamMember> findByWaitingTeam(WaitingTeam waitingTeam);
    List<WaitingTeamMember> findByWaitingTeamId(Long waitingTeamId);

}