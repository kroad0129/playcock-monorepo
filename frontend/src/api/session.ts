import { apiClient } from "./client";
import type { ApiResponse } from "../types/auth";
import type {
  SessionCreateRequest,
  SessionListItemResponse,
} from "../types/session";

export async function getSessions() {
  const response =
    await apiClient.get<ApiResponse<SessionListItemResponse[]>>("/session");
  return response.data.data;
}

export async function createSession(request: SessionCreateRequest) {
  const response = await apiClient.post<ApiResponse<number>>(
    "/session",
    request,
  );
  return response.data.data;
}

export async function endSession(sessionId: number) {
  const response = await apiClient.patch<ApiResponse<void>>(
    `/session/${sessionId}/end`,
  );
  return response.data;
}

export async function addParticipants(sessionId: number, memberIds: number[]) {
  const response = await apiClient.post<ApiResponse<void>>(
    `/session/${sessionId}/participant`,
    {
      memberIds,
    },
  );
  return response.data;
}

export async function removeParticipant(
  sessionId: number,
  participantId: number,
) {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/session/${sessionId}/participant/${participantId}`,
  );
  return response.data;
}

export async function createWaitingTeam(
  sessionId: number,
  sessionParticipantIds: number[],
) {
  const response = await apiClient.post<ApiResponse<number>>(
    `/session/${sessionId}/waiting-team`,
    {
      sessionParticipantIds,
    },
  );
  return response.data.data;
}

export async function cancelWaitingTeam(
  sessionId: number,
  waitingTeamId: number,
) {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/session/${sessionId}/waiting-team/${waitingTeamId}`,
  );
  return response.data;
}

export async function startMatch(sessionId: number, waitingTeamId: number) {
  const response = await apiClient.post<ApiResponse<void>>(
    `/session/${sessionId}/match/start`,
    {
      waitingTeamId,
    },
  );
  return response.data;
}

export async function endMatch(sessionId: number, matchId: number) {
  const response = await apiClient.post<ApiResponse<void>>(
    `/session/${sessionId}/match/${matchId}/end`,
  );
  return response.data;
}
