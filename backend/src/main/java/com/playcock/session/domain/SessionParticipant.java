package com.playcock.session.domain;

import com.playcock.member.Member;
import com.playcock.global.enums.MatchType;
import com.playcock.global.enums.SessionParticipantStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionParticipant {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

    @Enumerated(EnumType.STRING)
    private SessionParticipantStatus status;

    private LocalDateTime joinedAt;
    private LocalDateTime lastPlayedAt;
    private LocalDateTime listedAt;

    private int totalMatchCount;
    private int maleDoubleCount;
    private int femaleDoubleCount;
    private int mixedDoubleCount;

    public void toWaiting() {
        this.status = SessionParticipantStatus.WAITING;
    }

    public void toPlaying() {
        this.status = SessionParticipantStatus.PLAYING;
    }

    public void completeMatch(MatchType type) {
        this.lastPlayedAt = LocalDateTime.now();
        this.totalMatchCount++;

        switch (type) {
            case MALE_DOUBLE -> maleDoubleCount++;
            case FEMALE_DOUBLE -> femaleDoubleCount++;
            case MIXED_DOUBLE -> mixedDoubleCount++;
        }
    }

    public void toListedResetTimer() {
        this.status = SessionParticipantStatus.LISTED;
        this.listedAt = LocalDateTime.now();
    }

    public void toListedKeepTimer() {
        this.status = SessionParticipantStatus.LISTED;
    }

    public void remove() {
        if (this.status != SessionParticipantStatus.LISTED) {
            throw new IllegalStateException("LISTED 상태만 제거할 수 있습니다.");
        }
        this.status = SessionParticipantStatus.REMOVED;
    }

    public void restore() {
        this.status = SessionParticipantStatus.LISTED;
        this.listedAt = LocalDateTime.now();
    }

}