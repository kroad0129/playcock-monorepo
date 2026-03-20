package com.playcock.session.dto;

import com.playcock.global.enums.MatchStatus;
import com.playcock.global.enums.MatchType;
import com.playcock.global.enums.SessionParticipantStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SessionDashboardResponse {

    @Schema(description = "세션 ID", example = "1")
    private Long sessionId;

    @Schema(description = "세션 제목", example = "2026년 3월 정기 운동")
    private String title;

    @Schema(description = "현재 LISTED 상태 참가자 목록")
    private List<ParticipantDto> listedParticipants;

    @Schema(description = "현재 REMOVED 상태 참가자 목록")
    private List<ParticipantDto> removedParticipants;

    @Schema(description = "현재 4명씩 묶여서 대기 중인 팀 목록")
    private List<WaitingTeamDto> waitingTeams;

    @Schema(description = "진행 중이거나 종료된 경기 목록")
    private List<MatchDto> matches;

    @Schema(description = "세션 종료 가능 여부", example = "true")
    private boolean canEndSession;

    private LocalDateTime serverNow;

    @Getter
    @Builder
    public static class ParticipantDto {

        @Schema(description = "세션 참가자 고유 ID", example = "10")
        private Long participantId;

        @Schema(description = "멤버 고유 ID", example = "7")
        private Long memberId;

        @Schema(description = "멤버 이름", example = "김민수")
        private String memberName;

        @Schema(description = "성별", example = "MALE")
        private String gender;

        @Schema(description = "현재 상태", example = "LISTED")
        private SessionParticipantStatus status;

        @Schema(description = "오늘 세션에서 진행한 총 경기 횟수", example = "2")
        private int totalMatchCount;

        @Schema(description = "남복 경기 수", example = "1")
        private int maleDoubleCount;

        @Schema(description = "여복 경기 수", example = "0")
        private int femaleDoubleCount;

        @Schema(description = "혼복 경기 수", example = "1")
        private int mixedDoubleCount;

        @Schema(description = "마지막으로 경기한 시간")
        private LocalDateTime lastPlayedAt;

        @Schema(description = "마지막 경기 이후 경과 분")
        private Long restMinutes;

        @Schema(description = "참가자 제외 가능 여부", example = "true")
        private boolean canRemove;

        private LocalDateTime listedAt;
    }

    @Getter
    @Builder
    public static class WaitingTeamDto {

        @Schema(description = "대기팀 고유 ID", example = "5")
        private Long waitingTeamId;

        @Schema(description = "대기 순서", example = "1")
        private Integer queueOrder;

        @Schema(description = "대기팀에 속한 멤버 4명의 정보")
        private List<ParticipantDto> members;

        @Schema(description = "대기팀 취소 가능 여부", example = "true")
        private boolean canCancel;

        @Schema(description = "경기 시작 가능 여부", example = "true")
        private boolean canStartMatch;

        private LocalDateTime createdAt;
    }

    @Getter
    @Builder
    public static class MatchDto {

        @Schema(description = "경기 고유 ID", example = "3")
        private Long matchId;

        @Schema(description = "경기 번호", example = "1")
        private Integer matchNumber;

        @Schema(description = "경기 타입", example = "MIXED_DOUBLE")
        private MatchType matchType;

        @Schema(description = "경기 상태", example = "IN_PROGRESS")
        private MatchStatus status;

        @Schema(description = "이 경기에 배정된 총 4명의 참가자들")
        private List<ParticipantDto> participants;

        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
    }
}