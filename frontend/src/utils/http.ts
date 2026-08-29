import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "요청 처리에 실패했습니다.",
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  return fallback;
}
