import { apiClient } from "./client";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  UserCreateRequest,
  UserCreateResponse,
} from "../types/auth";

export async function login(request: LoginRequest) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    request,
  );
  return response.data.data;
}

export async function signup(request: UserCreateRequest) {
  const response = await apiClient.post<ApiResponse<UserCreateResponse>>(
    "/users",
    request,
  );
  return response.data.data;
}

export async function getMyInfo() {
  const response =
    await apiClient.get<ApiResponse<UserCreateResponse>>("/users/me");
  return response.data.data;
}
