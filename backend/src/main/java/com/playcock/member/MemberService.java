package com.playcock.member;

import com.playcock.global.enums.Gender;
import com.playcock.global.enums.MemberType;
import com.playcock.global.enums.Grade;
import com.playcock.global.exception.MemberNotFoundException;
import com.playcock.member.dto.MemberCreateRequest;
import com.playcock.member.dto.MemberResponse;
import com.playcock.member.dto.MemberUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberResponse createMember(MemberCreateRequest request) {
        Member member = Member.builder()
                .name(request.getName())
                .schoolName(request.getSchoolName())
                .generation(normalizeGeneration(request.getGeneration()))
                .email(request.getEmail())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .memberType(request.getMemberType())
                .active(request.getActive())
                .grade(request.getGrade())
                .note(request.getNote())
                .build();

        Member savedMember = memberRepository.save(member);
        return MemberResponse.from(savedMember);
    }

    @Transactional(readOnly = true)
    public MemberResponse getMember(Long memberId) {
        Member member = findActiveMember(memberId);
        return MemberResponse.from(member);
    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> getMembers(
            String name,
            String schoolName,
            String generation,
            Gender gender,
            MemberType memberType,
            Grade grade,
            Boolean active,
            Pageable pageable
    ) {
        String normalizedGeneration = normalizeGeneration(generation);

        Specification<Member> spec = Specification
                .where(MemberSpecification.notDeleted())
                .and(MemberSpecification.nameContains(name))
                .and(MemberSpecification.schoolNameContains(schoolName))
                .and(MemberSpecification.generationEqual(normalizedGeneration))
                .and(MemberSpecification.genderEqual(gender))
                .and(MemberSpecification.memberTypeEqual(memberType))
                .and(MemberSpecification.gradeEqual(grade))
                .and(MemberSpecification.activeEqual(active));

        return memberRepository.findAll(spec, pageable)
                .map(MemberResponse::from);
    }

    public MemberResponse updateMember(Long memberId, MemberUpdateRequest request) {
        Member member = findActiveMember(memberId);

        member.update(
                request.getName(),
                request.getSchoolName(),
                normalizeGeneration(request.getGeneration()),
                request.getEmail(),
                request.getGender(),
                request.getPhoneNumber(),
                request.getMemberType(),
                request.getActive(),
                request.getGrade(),
                request.getNote()
        );

        return MemberResponse.from(member);
    }

    public void deleteMember(Long memberId) {
        Member member = findActiveMember(memberId);
        member.softDelete();
    }

    private String normalizeGeneration(String generation) {
        if (!StringUtils.hasText(generation)) {
            return null;
        }

        String value = generation.trim();

        if (value.endsWith("기")) {
            value = value.substring(0, value.length() - 1).trim();
        }

        if (!value.matches("^\\d+(\\.\\d+)?$")) {
            throw new IllegalArgumentException("숫자만 가능합니다. 예: 1, 1기, 1.5, 1.5기");
        }

        return value;
    }

    private Member findActiveMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("해당 멤버를 찾을 수 없습니다. id=" + memberId));

        if (member.isDeleted()) {
            throw new MemberNotFoundException("삭제된 멤버입니다. id=" + memberId);
        }

        return member;
    }
}
