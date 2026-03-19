package com.playcock.session.domain;

import com.playcock.global.enums.MatchStatus;
import com.playcock.global.enums.MatchType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Session session;

    private Integer matchNumber;

    @Enumerated(EnumType.STRING)
    private MatchType matchType;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    public void end() {
        this.status = MatchStatus.ENDED;
        this.endedAt = LocalDateTime.now();
    }
}