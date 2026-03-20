package com.playcock.session.service;

import com.playcock.global.enums.MatchStatus;
import com.playcock.global.enums.SessionCategory;
import com.playcock.global.enums.SessionParticipantStatus;
import com.playcock.global.enums.SessionStatus;
import com.playcock.member.Member;
import com.playcock.member.MemberRepository;
import com.playcock.session.domain.Session;
import com.playcock.session.domain.SessionParticipant;
import com.playcock.session.dto.ParticipantAddRequest;
import com.playcock.session.dto.SessionCreateRequest;
import com.playcock.session.dto.SessionListItemResponse;
import com.playcock.session.repository.MatchRepository;
import com.playcock.session.repository.SessionParticipantRepository;
import com.playcock.session.repository.SessionRepository;
import com.playcock.session.repository.WaitingTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository participantRepository;
    private final MemberRepository memberRepository;
    private final SessionEventPublisher publisher;
    private final WaitingTeamRepository waitingTeamRepository;
    private final MatchRepository matchRepository;

    public Long createSession(SessionCreateRequest request) {
        LocalDateTime now = LocalDateTime.now();

        SessionCategory category = request.getCategory() != null
                ? request.getCategory()
                : SessionCategory.REGULAR;

        Session session = Session.builder()
                .title(generateSessionTitle(now, category))
                .category(category)
                .sessionDate(now.toLocalDate())
                .location(request.getLocation())
                .note(request.getNote())
                .build();

        session.start();

        Session savedSession = sessionRepository.save(session);
        return savedSession.getId();
    }

    private String generateSessionTitle(LocalDateTime dateTime, SessionCategory category) {
        String formatted = dateTime.format(
                DateTimeFormatter.ofPattern("yyyy년 M월 d일 H시 mm분", Locale.KOREAN)
        );
        return formatted + " " + getCategoryLabel(category);
    }

    private String getCategoryLabel(SessionCategory category) {
        return switch (category) {
            case REGULAR -> "정기운동";
            case FLASH -> "번개";
        };
    }

    public void endSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 세션입니다. sessionId: " + sessionId));

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new IllegalArgumentException("이미 종료된 세션입니다. sessionId: " + sessionId);
        }

        if (waitingTeamRepository.existsBySession(session)) {
            throw new IllegalArgumentException("대기팀이 남아 있는 세션은 종료할 수 없습니다.");
        }

        if (matchRepository.existsBySessionAndStatus(session, MatchStatus.IN_PROGRESS)) {
            throw new IllegalArgumentException("진행 중인 경기가 남아 있는 세션은 종료할 수 없습니다.");
        }

        session.end();
        publisher.publish(session.getId());
    }

    /**
     * 세션 참가자 추가
     * - 세션에 처음 들어오는 멤버면 신규 생성
     * - REMOVED 상태였던 멤버면 복귀(RESTORE)
     * - 이미 LISTED / WAITING / PLAYING 이면 예외
     */
    public void addParticipants(Long sessionId, ParticipantAddRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 세션입니다. sessionId: " + sessionId));

        validateSessionNotEnded(session);
        request.validateNoDuplicateIds();

        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            addParticipantsInternal(session, request.getMemberIds());
            publisher.publish(session.getId());
        }
    }

    private void addParticipantsInternal(Session session, List<Long> memberIds) {
        List<Member> members = memberRepository.findAllById(memberIds);

        if (members.size() != memberIds.size()) {
            throw new IllegalArgumentException("존재하지 않는 멤버가 포함되어 있습니다.");
        }

        List<SessionParticipant> newParticipants = members.stream()
                .map(member -> upsertParticipant(session, member))
                .filter(participant -> participant.getId() == null)
                .collect(Collectors.toList());

        if (!newParticipants.isEmpty()) {
            participantRepository.saveAll(newParticipants);
        }
    }

    private SessionParticipant upsertParticipant(Session session, Member member) {
        SessionParticipant existingParticipant = participantRepository.findBySessionAndMember(session, member)
                .orElse(null);

        if (existingParticipant == null) {
            return createNewParticipant(session, member);
        }

        return restoreOrThrow(existingParticipant, member.getId());
    }

    private SessionParticipant createNewParticipant(Session session, Member member) {
        return SessionParticipant.builder()
                .session(session)
                .member(member)
                .status(SessionParticipantStatus.LISTED)
                .joinedAt(LocalDateTime.now())
                .listedAt(LocalDateTime.now())
                .build();
    }

    private SessionParticipant restoreOrThrow(SessionParticipant participant, Long memberId) {
        return switch (participant.getStatus()) {
            case LISTED -> throw new IllegalArgumentException(
                    "이미 참가 중인 멤버입니다. memberId: " + memberId
            );
            case WAITING -> throw new IllegalArgumentException(
                    "현재 대기 중인 멤버입니다. memberId: " + memberId
            );
            case PLAYING -> throw new IllegalArgumentException(
                    "현재 경기 중인 멤버입니다. memberId: " + memberId
            );
            case REMOVED -> {
                participant.restore();
                yield participant;
            }
        };
    }

    /**
     * 세션 참가자 제외
     * - LISTED 상태만 제거 가능
     * - 실제 삭제는 하지 않고 REMOVED 처리
     */
    public void removeParticipant(Long sessionId, Long participantId) {
        SessionParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 참가자입니다."));

        if (!participant.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("해당 참가자는 현재 세션에 속하지 않습니다.");
        }

        validateSessionNotEnded(participant.getSession());

        if (participant.getStatus() != SessionParticipantStatus.LISTED) {
            throw new IllegalArgumentException("LISTED 상태 참가자만 제외할 수 있습니다.");
        }

        participant.remove();
        publisher.publish(sessionId);
    }

    private void validateSessionNotEnded(Session session) {
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new IllegalArgumentException("이미 종료된 세션입니다. sessionId: " + session.getId());
        }
    }

    @Transactional(readOnly = true)
    public List<SessionListItemResponse> getSessions() {
        return sessionRepository.findAllByOrderByStartedAtDesc().stream()
                .map(session -> SessionListItemResponse.builder()
                        .sessionId(session.getId())
                        .title(session.getTitle())
                        .category(session.getCategory())
                        .status(session.getStatus())
                        .location(session.getLocation())
                        .startedAt(session.getStartedAt())
                        .endedAt(session.getEndedAt())
                        .build())
                .collect(Collectors.toList());
    }
}