package com.playcock.session.service;

import com.playcock.global.enums.*;
import com.playcock.session.domain.*;
import com.playcock.session.repository.MatchParticipantRepository;
import com.playcock.session.repository.MatchRepository;
import com.playcock.session.repository.WaitingTeamMemberRepository;
import com.playcock.session.repository.WaitingTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionFlowService {

    private final WaitingTeamRepository waitingTeamRepository;
    private final WaitingTeamMemberRepository waitingTeamMemberRepository;
    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final SessionEventPublisher publisher;

    public void startMatch(Long sessionId, Long waitingTeamId) {
        WaitingTeam team = waitingTeamRepository.findById(waitingTeamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대기팀입니다. waitingTeamId: " + waitingTeamId));

        validateWaitingTeamBelongsToSession(sessionId, team);
        validateSessionNotEnded(team.getSession());

        List<WaitingTeamMember> members = waitingTeamMemberRepository.findByWaitingTeam(team);
        validateStartableTeam(members);

        Match match = Match.builder()
                .session(team.getSession())
                .matchNumber(generateMatchNumber(team.getSession()))
                .status(MatchStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .matchType(resolveMatchType(members))
                .build();

        matchRepository.save(match);

        for (WaitingTeamMember member : members) {
            member.getSessionParticipant().toPlaying();

            matchParticipantRepository.save(
                    MatchParticipant.builder()
                            .match(match)
                            .sessionParticipant(member.getSessionParticipant())
                            .build()
            );
        }

        Session session = team.getSession();

        waitingTeamMemberRepository.deleteAll(members);
        waitingTeamRepository.delete(team);

        reOrderQueue(session);

        publisher.publish(sessionId);
    }

    private void reOrderQueue(Session session) {
        List<WaitingTeam> waitingTeams = waitingTeamRepository.findBySessionOrderByQueueOrderAsc(session);

        for (int i = 0; i < waitingTeams.size(); i++) {
            waitingTeams.get(i).updateQueueOrder(i + 1);
        }
    }

    public void endMatch(Long sessionId, Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 경기입니다. matchId: " + matchId));

        if (!match.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("해당 경기는 현재 세션에 속하지 않습니다.");
        }

        validateSessionNotEnded(match.getSession());

        if (match.getStatus() == MatchStatus.ENDED) {
            throw new IllegalArgumentException("이미 종료된 경기입니다. matchId: " + matchId);
        }

        match.end();

        List<MatchParticipant> participants = matchParticipantRepository.findByMatch(match);
        for (MatchParticipant participant : participants) {
            participant.getSessionParticipant().completeMatch(match.getMatchType());
            participant.getSessionParticipant().toListedResetTimer();
        }

        publisher.publish(sessionId);
    }

    private void validateWaitingTeamBelongsToSession(Long sessionId, WaitingTeam team) {
        if (!team.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("해당 대기팀은 현재 세션에 속하지 않습니다.");
        }
    }

    private void validateStartableTeam(List<WaitingTeamMember> members) {
        if (members.size() != 4) {
            throw new IllegalArgumentException("경기는 정확히 4명의 대기팀으로만 시작할 수 있습니다.");
        }

        for (WaitingTeamMember member : members) {
            validateParticipantCanStartMatch(member.getSessionParticipant());
        }
    }

    private void validateParticipantCanStartMatch(com.playcock.session.domain.SessionParticipant participant) {
        switch (participant.getStatus()) {
            case WAITING -> {
                // 통과
            }
            case LISTED -> throw new IllegalArgumentException(
                    "LISTED 상태 참가자는 경기 시작이 불가능합니다. participantId: " + participant.getId()
            );
            case PLAYING -> throw new IllegalArgumentException(
                    "이미 경기 중인 참가자입니다. participantId: " + participant.getId()
            );
            case REMOVED -> throw new IllegalArgumentException(
                    "제외된 참가자는 경기 시작이 불가능합니다. participantId: " + participant.getId()
            );
        }
    }

    private int generateMatchNumber(com.playcock.session.domain.Session session) {
        return matchRepository.findTopBySessionOrderByMatchNumberDesc(session)
                .map(match -> match.getMatchNumber() + 1)
                .orElse(1);
    }

    private MatchType resolveMatchType(List<WaitingTeamMember> members) {
        long maleCount = 0;
        long femaleCount = 0;

        for (WaitingTeamMember member : members) {
            if (member.getSessionParticipant().getMember().getGender() == Gender.MALE) {
                maleCount++;
            } else if (member.getSessionParticipant().getMember().getGender() == Gender.FEMALE) {
                femaleCount++;
            }
        }

        if (maleCount == 4) {
            return MatchType.MALE_DOUBLE;
        } else if (femaleCount == 4) {
            return MatchType.FEMALE_DOUBLE;
        } else {
            return MatchType.MIXED_DOUBLE;
        }
    }

    private void validateSessionNotEnded(Session session) {
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new IllegalArgumentException("이미 종료된 세션입니다. sessionId: " + session.getId());
        }
    }
}