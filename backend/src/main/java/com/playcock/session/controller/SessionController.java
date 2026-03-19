package com.playcock.session.controller;

import com.playcock.global.response.ApiResponse;
import com.playcock.session.dto.MatchStartRequest;
import com.playcock.session.dto.ParticipantAddRequest;
import com.playcock.session.dto.SessionCreateRequest;
import com.playcock.session.dto.SessionDashboardResponse;
import com.playcock.session.dto.SessionListItemResponse;
import com.playcock.session.dto.WaitingTeamCreateRequest;
import com.playcock.session.service.SessionDashboardService;
import com.playcock.session.service.SessionFlowService;
import com.playcock.session.service.SessionService;
import com.playcock.session.service.WaitingTeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Session", description = "세션(활동) 운영 및 게임 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/session")
public class SessionController {

    private final SessionService sessionService;
    private final WaitingTeamService waitingTeamService;
    private final SessionFlowService flowService;
    private final SessionDashboardService dashboardService;

    @Operation(summary = "세션 생성", description = "새로운 세션을 생성합니다.")
    @PostMapping
    public ApiResponse<Long> create(@Valid @RequestBody SessionCreateRequest request) {
        Long sessionId = sessionService.createSession(request);
        return ApiResponse.success(HttpStatus.CREATED.value(), "세션 생성 성공", sessionId);
    }

    @Operation(summary = "세션 종료", description = "세션을 종료합니다.")
    @PatchMapping("/{sessionId}/end")
    public ApiResponse<Void> endSession(@PathVariable Long sessionId) {
        sessionService.endSession(sessionId);
        return ApiResponse.success(HttpStatus.OK.value(), "세션 종료 성공", null);
    }

    @Operation(summary = "세션 참가자 추가", description = "세션에 멤버들을 추가합니다. REMOVED 상태 참가자는 자동 복귀됩니다.")
    @PostMapping("/{sessionId}/participant")
    public ApiResponse<Void> addParticipants(
            @PathVariable Long sessionId,
            @Valid @RequestBody ParticipantAddRequest request
    ) {
        sessionService.addParticipants(sessionId, request);
        return ApiResponse.success(HttpStatus.CREATED.value(), "세션 참가자 추가 성공", null);
    }

    @Operation(summary = "참가자 제외", description = "LISTED 상태 참가자만 제외(REMOVED) 처리합니다.")
    @DeleteMapping("/{sessionId}/participant/{participantId}")
    public ApiResponse<Void> removeParticipant(
            @PathVariable Long sessionId,
            @PathVariable Long participantId
    ) {
        sessionService.removeParticipant(sessionId, participantId);
        return ApiResponse.success(HttpStatus.OK.value(), "참가자 제외 성공", null);
    }

    @Operation(summary = "대기팀 생성", description = "4명의 세션 참가자를 묶어 대기팀을 생성합니다.")
    @PostMapping("/{sessionId}/waiting-team")
    public ApiResponse<Long> createWaitingTeam(
            @PathVariable Long sessionId,
            @Valid @RequestBody WaitingTeamCreateRequest request
    ) {
        Long waitingTeamId = waitingTeamService.createWaitingTeam(sessionId, request);
        return ApiResponse.success(HttpStatus.CREATED.value(), "대기팀 생성 성공", waitingTeamId);
    }

    @Operation(summary = "대기팀 취소", description = "대기팀을 취소하고 참가자들을 LISTED로 복구합니다.")
    @DeleteMapping("/{sessionId}/waiting-team/{waitingTeamId}")
    public ApiResponse<Void> cancelWaitingTeam(
            @PathVariable Long sessionId,
            @PathVariable Long waitingTeamId
    ) {
        waitingTeamService.cancelWaitingTeam(sessionId, waitingTeamId);
        return ApiResponse.success(HttpStatus.OK.value(), "대기팀 취소 성공", null);
    }

    @Operation(summary = "경기 시작", description = "대기팀을 경기로 시작합니다.")
    @PostMapping("/{sessionId}/match/start")
    public ApiResponse<Void> startMatch(
            @PathVariable Long sessionId,
            @Valid @RequestBody MatchStartRequest request
    ) {
        flowService.startMatch(sessionId, request.getWaitingTeamId());
        return ApiResponse.success(HttpStatus.OK.value(), "경기 시작 성공", null);
    }

    @Operation(summary = "경기 종료", description = "진행 중인 경기를 종료합니다.")
    @PostMapping("/{sessionId}/match/{matchId}/end")
    public ApiResponse<Void> endMatch(
            @PathVariable Long sessionId,
            @PathVariable Long matchId
    ) {
        flowService.endMatch(sessionId, matchId);
        return ApiResponse.success(HttpStatus.OK.value(), "경기 종료 성공", null);
    }

    @Operation(summary = "세션 대시보드 조회", description = "LISTED 참가자 / REMOVED 참가자 / 대기팀 / 경기 상태를 조회합니다.")
    @GetMapping("/{sessionId}/dashboard")
    public ApiResponse<SessionDashboardResponse> getDashboard(@PathVariable Long sessionId) {
        SessionDashboardResponse response = dashboardService.getDashboard(sessionId);
        return ApiResponse.success(HttpStatus.OK.value(), "대시보드 조회 성공", response);
    }

    @Operation(summary = "세션 목록 조회", description = "운영 중/종료된 세션 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<List<SessionListItemResponse>> getSessions() {
        List<SessionListItemResponse> response = sessionService.getSessions();
        return ApiResponse.success(HttpStatus.OK.value(), "세션 목록 조회 성공", response);
    }
}