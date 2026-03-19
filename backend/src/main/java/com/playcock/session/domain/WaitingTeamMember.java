package com.playcock.session.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitingTeamMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private WaitingTeam waitingTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    private SessionParticipant sessionParticipant;
}