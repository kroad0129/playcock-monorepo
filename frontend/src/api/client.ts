import axios from "axios";
import { getAccessToken, removeAccessToken } from "../utils/storage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      removeAccessToken();
      window.alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (status === 403) {
      window.alert("접근 권한이 없습니다.");
      return Promise.reject(error);
    }

    if (status >= 500) {
      window.alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
