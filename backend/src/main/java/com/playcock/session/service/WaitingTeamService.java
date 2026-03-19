package com.playcock.session.service;

import com.playcock.global.enums.SessionParticipantStatus;
import com.playcock.global.enums.SessionStatus;
import com.playcock.session.domain.Session;
import com.playcock.session.domain.SessionParticipant;
import com.playcock.session.domain.WaitingTeam;
import com.playcock.session.domain.WaitingTeamMember;
import com.playcock.session.dto.WaitingTeamCreateRequest;
import com.playcock.session.repository.SessionParticipantRepository;
import com.playcock.session.repository.SessionRepository;
import com.playcock.session.repository.WaitingTeamMemberRepository;
import com.playcock.session.repository.WaitingTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class WaitingTeamService {

    private final WaitingTeamRepository waitingTeamRepository;
    private final WaitingTeamMemberRepository waitingTeamMemberRepository;
    private final SessionParticipantRepository participantRepository;
    private final SessionRepository sessionRepository;
    private final SessionEventPublisher publisher;

    public Long createWaitingTeam(Long sessionId, WaitingTeamCreateRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 세션입니다. sessionId: " + sessionId));

        validateSessionNotEnded(session);
        request.validateNoDuplicateIds();
        validateCreateRequest(sessionId, request);

        int nextQueueOrder = waitingTeamRepository.findTopBySessionOrderByQueueOrderDesc(session)
                .map(team -> team.getQueueOrder() + 1)
                .orElse(1);

        WaitingTeam team = WaitingTeam.builder()
                .session(session)
                .queueOrder(nextQueueOrder)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        waitingTeamRepository.save(team);

        for (Long participantId : request.getSessionParticipantIds()) {
            SessionParticipant participant = participantRepository.findById(participantId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 참가자입니다. participantId: " + participantId));

            participant.toWaiting();

            waitingTeamMemberRepository.save(
                    WaitingTeamMember.builder()
                            .waitingTeam(team)
                            .sessionParticipant(participant)
                            .build()
            );
        }

        publisher.publish(sessionId);
        return team.getId();
    }

    public void cancelWaitingTeam(Long sessionId, Long waitingTeamId) {
        WaitingTeam team = waitingTeamRepository.findById(waitingTeamId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대기팀입니다. waitingTeamId: " + waitingTeamId));

        validateWaitingTeamBelongsToSession(sessionId, team);
        validateSessionNotEnded(team.getSession());

        List<WaitingTeamMember> members = waitingTeamMemberRepository.findByWaitingTeam(team);

        for (WaitingTeamMember member : members) {
            member.getSessionParticipant().toListedKeepTimer();
        }

        waitingTeamMemberRepository.deleteAll(members);
        waitingTeamRepository.delete(team);

        reOrderQueue(team.getSession());

        publisher.publish(sessionId);
    }

    private void reOrderQueue(Session session) {
        List<WaitingTeam> waitingTeams = waitingTeamRepository.findBySessionOrderByQueueOrderAsc(session);

        for (int i = 0; i < waitingTeams.size(); i++) {
            waitingTeams.get(i).updateQueueOrder(i + 1);
        }
    }

    private void validateCreateRequest(Long sessionId, WaitingTeamCreateRequest request) {
        if (request.getSessionParticipantIds() == null || request.getSessionParticipantIds().size() != 4) {
            throw new IllegalArgumentException("대기팀은 정확히 4명의 참가자로만 생성할 수 있습니다.");
        }

        Set<Long> uniqueIds = new HashSet<>(request.getSessionParticipantIds());
        if (uniqueIds.size() != 4) {
            throw new IllegalArgumentException("대기팀에는 중복 참가자를 넣을 수 없습니다.");
        }

        List<SessionParticipant> participants = participantRepository.findAllById(request.getSessionParticipantIds());
        if (participants.size() != 4) {
            throw new IllegalArgumentException("존재하지 않는 참가자가 포함되어 있습니다.");
        }

        for (SessionParticipant participant : participants) {
            if (!participant.getSession().getId().equals(sessionId)) {
                throw new IllegalArgumentException("다른 세션의 참가자는 대기팀에 넣을 수 없습니다. participantId: " + participant.getId());
            }

            validateParticipantCanJoinWaitingTeam(participant);
        }
    }

    private void validateParticipantCanJoinWaitingTeam(SessionParticipant participant) {
        switch (participant.getStatus()) {
            case LISTED -> {
                // 통과
            }
            case WAITING -> throw new IllegalArgumentException(
                    "이미 대기 중인 참가자입니다. participantId: " + participant.getId()
            );
            case PLAYING -> throw new IllegalArgumentException(
                    "경기 중인 참가자는 대기팀에 넣을 수 없습니다. participantId: " + participant.getId()
            );
            case REMOVED -> throw new IllegalArgumentException(
                    "제외된 참가자는 대기팀에 넣을 수 없습니다. participantId: " + participant.getId()
            );
        }
    }

    private void validateWaitingTeamBelongsToSession(Long sessionId, WaitingTeam team) {
        if (!team.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("해당 대기팀은 현재 세션에 속하지 않습니다.");
        }
    }

    private void validateSessionNotEnded(Session session) {
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new IllegalArgumentException("이미 종료된 세션입니다. sessionId: " + session.getId());
        }
    }
}