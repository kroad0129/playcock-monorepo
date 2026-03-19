package com.playcock.session.dto;

import com.playcock.global.enums.SessionCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
public class SessionCreateRequest {

    @Schema(description = "세션 카테고리 (생략 시 REGULAR)", example = "REGULAR")
    private SessionCategory category;

    @Schema(description = "모임 장소", example = "서초 체육관")
    private String location;

    @Schema(description = "비고 및 공지사항", example = "다들 늦지 않게 오세요~")
    private String note;
}