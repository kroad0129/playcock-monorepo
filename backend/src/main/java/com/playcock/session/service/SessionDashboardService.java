package com.playcock.session.service;

import com.playcock.global.enums.MatchStatus;
import com.playcock.global.enums.SessionParticipantStatus;
import com.playcock.global.enums.SessionStatus;
import com.playcock.session.domain.MatchParticipant;
import com.playcock.session.domain.Session;
import com.playcock.session.domain.SessionParticipant;
import com.playcock.session.domain.WaitingTeam;
import com.playcock.session.dto.SessionDashboardResponse;
import com.playcock.session.repository.MatchParticipantRepository;
import com.playcock.session.repository.MatchRepository;
import com.playcock.session.repository.SessionParticipantRepository;
import com.playcock.session.repository.SessionRepository;
import com.playcock.session.repository.WaitingTeamMemberRepository;
import com.playcock.session.repository.WaitingTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionDashboardService {

    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository sessionParticipantRepository;
    private final WaitingTeamRepository waitingTeamRepository;
    private final WaitingTeamMemberRepository waitingTeamMemberRepository;
    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    public SessionDashboardResponse getDashboard(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 세션입니다. sessionId: " + sessionId));

        List<SessionDashboardResponse.ParticipantDto> listedParticipants =
                sessionParticipantRepository.findBySessionAndStatus(session, SessionParticipantStatus.LISTED)
                        .stream()
                        .sorted(participantPriorityComparator())
                        .map(this::toParticipantDto)
                        .collect(Collectors.toList());

        List<SessionDashboardResponse.ParticipantDto> removedParticipants =
                sessionParticipantRepository.findBySessionAndStatus(session, SessionParticipantStatus.REMOVED)
                        .stream()
                        .sorted(participantPriorityComparator())
                        .map(this::toParticipantDto)
                        .collect(Collectors.toList());

        List<SessionDashboardResponse.WaitingTeamDto> waitingTeams =
                waitingTeamRepository.findBySessionOrderByQueueOrderAsc(session).stream()
                        .map(team -> {
                            List<SessionDashboardResponse.ParticipantDto> teamMembers =
                                    waitingTeamMemberRepository.findByWaitingTeam(team).stream()
                                            .map(wm -> toParticipantDto(wm.getSessionParticipant()))
                                            .collect(Collectors.toList());

                            return SessionDashboardResponse.WaitingTeamDto.builder()
                                    .waitingTeamId(team.getId())
                                    .queueOrder(team.getQueueOrder())
                                    .createdAt(team.getCreatedAt())
                                    .canCancel(canCancelWaitingTeam(session, team))
                                    .canStartMatch(canStartMatch(teamMembers))
                                    .members(teamMembers)
                                    .build();
                        })
                        .collect(Collectors.toList());

        List<SessionDashboardResponse.MatchDto> matches =
                matchRepository.findBySessionAndStatusOrderByMatchNumberDesc(session, MatchStatus.IN_PROGRESS)
                        .stream()
                        .map(match -> {
                            List<MatchParticipant> matchParticipants = matchParticipantRepository.findByMatch(match);

                            List<SessionDashboardResponse.ParticipantDto> participants = matchParticipants.stream()
                                    .map(mp -> toParticipantDto(mp.getSessionParticipant()))
                                    .collect(Collectors.toList());

                            return SessionDashboardResponse.MatchDto.builder()
                                    .matchId(match.getId())
                                    .matchNumber(match.getMatchNumber())
                                    .matchType(match.getMatchType())
                                    .status(match.getStatus())
                                    .startedAt(match.getStartedAt())
                                    .endedAt(match.getEndedAt())
                                    .participants(participants)
                                    .build();
                        })
                        .collect(Collectors.toList());

        return SessionDashboardResponse.builder()
                .sessionId(session.getId())
                .title(session.getTitle())
                .serverNow(LocalDateTime.now())
                .listedParticipants(listedParticipants)
                .removedParticipants(removedParticipants)
                .waitingTeams(waitingTeams)
                .matches(matches)
                .canEndSession(canEndSession(session))
                .build();
    }

    private SessionDashboardResponse.ParticipantDto toParticipantDto(SessionParticipant participant) {
        return SessionDashboardResponse.ParticipantDto.builder()
                .participantId(participant.getId())
                .memberId(participant.getMember().getId())
                .listedAt(participant.getListedAt())
                .memberName(participant.getMember().getName())
                .gender(participant.getMember().getGender().name())
                .status(participant.getStatus())
                .totalMatchCount(participant.getTotalMatchCount())
                .maleDoubleCount(participant.getMaleDoubleCount())
                .femaleDoubleCount(participant.getFemaleDoubleCount())
                .mixedDoubleCount(participant.getMixedDoubleCount())
                .lastPlayedAt(participant.getLastPlayedAt())
                .restMinutes(calculateRestMinutes(participant.getLastPlayedAt()))
                .canRemove(canRemoveParticipant(participant))
                .build();
    }

    private Long calculateRestMinutes(LocalDateTime lastPlayedAt) {
        if (lastPlayedAt == null) {
            return null;
        }
        return Duration.between(lastPlayedAt, LocalDateTime.now()).toMinutes();
    }

    private Comparator<SessionParticipant> participantPriorityComparator() {
        return Comparator
                .comparingInt(this::statusPriority)
                .thenComparingInt(SessionParticipant::getTotalMatchCount)
                .thenComparing(
                        SessionParticipant::getLastPlayedAt,
                        Comparator.nullsFirst(Comparator.naturalOrder())
                );
    }

    private int statusPriority(SessionParticipant participant) {
        return switch (participant.getStatus()) {
            case LISTED -> 0;
            case WAITING -> 1;
            case PLAYING -> 2;
            case REMOVED -> 3;
        };
    }

    private boolean canRemoveParticipant(SessionParticipant participant) {
        return participant.getSession().getStatus() != SessionStatus.ENDED
                && participant.getStatus() == SessionParticipantStatus.LISTED;
    }

    private boolean canCancelWaitingTeam(Session session, WaitingTeam team) {
        return session.getStatus() != SessionStatus.ENDED;
    }

    private boolean canStartMatch(List<SessionDashboardResponse.ParticipantDto> teamMembers) {
        return teamMembers.size() == 4
                && teamMembers.stream().allMatch(member -> member.getStatus() == SessionParticipantStatus.WAITING);
    }

    private boolean canEndSession(Session session) {
        if (session.getStatus() == SessionStatus.ENDED) {
            return false;
        }

        boolean hasWaitingTeams = waitingTeamRepository.existsBySession(session);
        boolean hasInProgressMatch = matchRepository.existsBySessionAndStatus(session, MatchStatus.IN_PROGRESS);

        return !hasWaitingTeams && !hasInProgressMatch;
    }
}