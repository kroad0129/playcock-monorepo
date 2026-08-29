import { apiClient } from "./client";
import type { ApiResponse } from "../types/auth";
import type { SessionDashboardResponse } from "../types/dashboard";

export async function getSessionDashboard(sessionId: number) {
  const response = await apiClient.get<ApiResponse<SessionDashboardResponse>>(
    `/session/${sessionId}/dashboard`,
  );
  return response.data.data;
}
