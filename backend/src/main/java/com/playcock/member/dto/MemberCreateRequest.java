package com.playcock.member.dto;

import com.playcock.global.enums.Gender;
import com.playcock.global.enums.MemberType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberCreateRequest {

    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    private String schoolName;
    private String generation;
    private String email;

    @NotNull(message = "성별은 필수입니다.")
    private Gender gender;

    private String phoneNumber;

    @NotNull(message = "멤버 타입은 필수입니다.")
    private MemberType memberType;

    @NotNull(message = "활성 여부는 필수입니다.")
    private Boolean active;

    private String note;
}