package com.playcock.member;

import com.playcock.global.enums.Gender;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class MemberSpecification {

    public static Specification<Member> nameContains(String name) {
        return (root, query, cb) ->
                StringUtils.hasText(name)
                        ? cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%")
                        : null;
    }

    public static Specification<Member> schoolNameContains(String schoolName) {
        return (root, query, cb) ->
                StringUtils.hasText(schoolName)
                        ? cb.like(cb.lower(root.get("schoolName")), "%" + schoolName.toLowerCase() + "%")
                        : null;
    }

    public static Specification<Member> generationEqual(String generation) {
        return (root, query, cb) ->
                StringUtils.hasText(generation)
                        ? cb.equal(root.get("generation"), generation)
                        : null;
    }

    public static Specification<Member> genderEqual(Gender gender) {
        return (root, query, cb) ->
                gender != null
                        ? cb.equal(root.get("gender"), gender)
                        : null;
    }

    public static Specification<Member> activeEqual(Boolean active) {
        return (root, query, cb) ->
                active != null
                        ? cb.equal(root.get("active"), active)
                        : null;
    }

    public static Specification<Member> notDeleted() {
        return (root, query, cb) ->
                cb.isNull(root.get("deletedAt"));
    }
}