package com.playcock.session.dto;

import com.playcock.global.enums.SessionCategory;
import com.playcock.global.enums.SessionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SessionListItemResponse {

    private Long sessionId;
    private String title;
    private SessionCategory category;
    private String note;
    private SessionStatus status;
    private String location;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
}