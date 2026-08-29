export type SessionParticipantStatus =
  | "LISTED"
  | "WAITING"
  | "PLAYING"
  | "REMOVED";
export type MatchStatus = "IN_PROGRESS" | "ENDED";
export type MatchType = "MALE_DOUBLE" | "FEMALE_DOUBLE" | "MIXED_DOUBLE";

export interface ParticipantDto {
  participantId: number;
  memberId: number;
  memberName: string;
  gender: string;
  status: SessionParticipantStatus;
  totalMatchCount: number;
  maleDoubleCount: number;
  femaleDoubleCount: number;
  mixedDoubleCount: number;
  lastPlayedAt: string | null;
  restMinutes: number | null;
  canRemove: boolean;
  listedAt: string | null;
}

export interface WaitingTeamDto {
  waitingTeamId: number;
  queueOrder: number;
  members: ParticipantDto[];
  canCancel: boolean;
  canStartMatch: boolean;
  createdAt: string | null;
}

export interface MatchDto {
  matchId: number;
  matchNumber: number;
  matchType: MatchType;
  status: MatchStatus;
  participants: ParticipantDto[];
  startedAt: string | null;
  endedAt: string | null;
}

export interface SessionDashboardResponse {
  sessionId: number;
  title: string;
  listedParticipants: ParticipantDto[];
  removedParticipants: ParticipantDto[];
  waitingTeams: WaitingTeamDto[];
  matches: MatchDto[];
  canEndSession: boolean;
  serverNow: string | null;
}
