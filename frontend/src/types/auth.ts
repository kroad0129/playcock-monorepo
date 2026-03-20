export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserCreateResponse {
  id: number;
  email: string;
  name: string;
  role: "USER" | "MANAGER" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
}
