package com.playcock.member;

import com.playcock.global.entity.BaseTimeEntity;
import com.playcock.global.enums.Gender;
import com.playcock.global.enums.MemberType;
import com.playcock.global.enums.Grade;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "members")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(length = 100)
    private String schoolName;

    @Column(length = 20)
    private String generation;

    @Column(length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Column(length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberType memberType;

    @Column(nullable = false)
    private boolean active;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Grade grade = Grade.NONE;

    @Column(length = 500)
    private String note;

    private LocalDateTime deletedAt;

    @Builder
    public Member(
            String name,
            String schoolName,
            String generation,
            String email,
            Gender gender,
            String phoneNumber,
            MemberType memberType,
            boolean active,
            Grade grade,
            String note
    ) {
        this.name = name;
        this.schoolName = schoolName;
        this.generation = generation;
        this.email = email;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.memberType = memberType;
        this.active = active;
        this.grade = grade != null ? grade : Grade.NONE;
        this.note = note;
    }

    public void update(
            String name,
            String schoolName,
            String generation,
            String email,
            Gender gender,
            String phoneNumber,
            MemberType memberType,
            boolean active,
            Grade grade,
            String note
    ) {
        this.name = name;
        this.schoolName = schoolName;
        this.generation = generation;
        this.email = email;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.memberType = memberType;
        this.active = active;
        if(grade != null) this.grade = grade;
        this.note = note;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}
