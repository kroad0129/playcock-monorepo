package com.playcock.session.domain;

import com.playcock.global.enums.SessionCategory;
import com.playcock.global.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private SessionCategory category;

    private LocalDate sessionDate;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    private String location;
    private String note;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    public void start() {
        this.status = SessionStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
    }

    public void end() {
        this.status = SessionStatus.ENDED;
        this.endedAt = LocalDateTime.now();
    }
}