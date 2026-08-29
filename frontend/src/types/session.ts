export type SessionCategory = "REGULAR" | "FLASH";
export type SessionStatus = "IN_PROGRESS" | "ENDED";

export interface SessionListItemResponse {
  sessionId: number;
  title: string;
  category: SessionCategory;
  status: SessionStatus;
  location: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface SessionCreateRequest {
  category?: SessionCategory;
  location?: string;
  note?: string;
}
