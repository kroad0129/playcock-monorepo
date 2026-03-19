package com.playcock.session.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.HashSet;
import java.util.List;

@Getter
public class WaitingTeamCreateRequest {

    @NotNull(message = "세션 참가자 ID 목록은 필수입니다.")
    @Size(min = 4, max = 4, message = "대기팀은 정확히 4명이어야 합니다.")
    private List<Long> sessionParticipantIds;

    public void validateNoDuplicateIds() {
        if (sessionParticipantIds == null) {
            return;
        }

        if (new HashSet<>(sessionParticipantIds).size() != sessionParticipantIds.size()) {
            throw new IllegalArgumentException("대기팀 참가자 ID에 중복이 있습니다.");
        }
    }
}