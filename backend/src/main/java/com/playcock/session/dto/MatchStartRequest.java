package com.playcock.session.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class MatchStartRequest {

    @NotNull(message = "대기팀 ID는 필수입니다.")
    private Long waitingTeamId;
}