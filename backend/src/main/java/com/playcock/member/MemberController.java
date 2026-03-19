package com.playcock.member;

import com.playcock.global.enums.Gender;
import com.playcock.global.response.ApiResponse;
import com.playcock.member.dto.MemberCreateRequest;
import com.playcock.member.dto.MemberResponse;
import com.playcock.member.dto.MemberUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Member", description = "멤버 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "멤버 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MemberResponse> createMember(@Valid @RequestBody MemberCreateRequest request) {
        MemberResponse response = memberService.createMember(request);
        return ApiResponse.success(HttpStatus.CREATED.value(), "멤버 등록 성공", response);
    }

    @Operation(summary = "멤버 단건 조회")
    @GetMapping("/{memberId}")
    public ApiResponse<MemberResponse> getMember(@PathVariable Long memberId) {
        MemberResponse response = memberService.getMember(memberId);
        return ApiResponse.success(HttpStatus.OK.value(), "멤버 조회 성공", response);
    }

    @Operation(summary = "멤버 목록 조회 / 검색 / 페이징 / 정렬")
    @GetMapping
    public ApiResponse<Page<MemberResponse>> getMembers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String schoolName,
            @RequestParam(required = false) String generation,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParts = sort.split(",");

        String sortField = sortParts[0];
        String sortDirection = sortParts.length > 1 ? sortParts[1] : "desc";

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(sortDirection), sortField)
        );

        Page<MemberResponse> response = memberService.getMembers(
                name,
                schoolName,
                generation,
                gender,
                active,
                pageable
        );

        return ApiResponse.success(HttpStatus.OK.value(), "멤버 목록 조회 성공", response);
    }

    @Operation(summary = "멤버 수정")
    @PutMapping("/{memberId}")
    public ApiResponse<MemberResponse> updateMember(
            @PathVariable Long memberId,
            @Valid @RequestBody MemberUpdateRequest request
    ) {
        MemberResponse response = memberService.updateMember(memberId, request);
        return ApiResponse.success(HttpStatus.OK.value(), "멤버 수정 성공", response);
    }

    @Operation(summary = "멤버 삭제")
    @DeleteMapping("/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteMember(@PathVariable Long memberId) {
        memberService.deleteMember(memberId);
        return ApiResponse.success(HttpStatus.NO_CONTENT.value(), "멤버 삭제 성공", null);
    }
}