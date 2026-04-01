package com.playcock.member.dto;

import com.playcock.global.enums.Gender;
import com.playcock.global.enums.MemberType;
import com.playcock.global.enums.Grade;
import com.playcock.member.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberResponse {

    private Long id;
    private String name;
    private String schoolName;
    private String generation;
    private String email;
    private Gender gender;
    private String phoneNumber;
    private MemberType memberType;
    private boolean active;
    private Grade grade;
    private String note;

    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .schoolName(member.getSchoolName())
                .generation(member.getGeneration())
                .email(member.getEmail())
                .gender(member.getGender())
                .phoneNumber(member.getPhoneNumber())
                .memberType(member.getMemberType())
                .active(member.isActive())
                .grade(member.getGrade())
                .note(member.getNote())
                .build();
    }
}
