package com.playcock.session.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MatchParticipant {

    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    private SessionParticipant sessionParticipant;

    public static MatchParticipant create(Match match, SessionParticipant participant) {
        return MatchParticipant.builder()
                .match(match)
                .sessionParticipant(participant)
                .build();
    }
}