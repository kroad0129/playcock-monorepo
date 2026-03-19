package com.playcock.session.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.HashSet;
import java.util.List;

@Getter
public class ParticipantAddRequest {

    @NotEmpty(message = "추가할 멤버 ID 목록은 비어 있을 수 없습니다.")
    private List<Long> memberIds;

    public void validateNoDuplicateIds() {
        if (memberIds == null) {
            return;
        }

        if (new HashSet<>(memberIds).size() != memberIds.size()) {
            throw new IllegalArgumentException("추가할 멤버 ID에 중복이 있습니다.");
        }
    }
}