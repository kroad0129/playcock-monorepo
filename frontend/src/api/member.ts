import { apiClient } from "./client";
import type {
  MemberCreateRequest,
  MemberPageData,
  MemberResponse,
  MemberUpdateRequest,
  Gender,
  MemberType,
} from "../types/member";
import type { ApiResponse } from "../types/auth";

export async function getMembers(params?: {
  name?: string;
  schoolName?: string;
  generation?: string;
  gender?: Gender;
  memberType?: MemberType;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<MemberPageData> {
  const query = new URLSearchParams();

  if (params?.name) query.set("name", params.name);
  if (params?.schoolName) query.set("schoolName", params.schoolName);
  if (params?.generation) query.set("generation", params.generation);
  if (params?.gender) query.set("gender", params.gender);
  if (params?.memberType) query.set("memberType", params.memberType);
  if (typeof params?.active === "boolean")
    query.set("active", String(params.active));
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 50));
  query.set("sort", params?.sort ?? "id,desc");

  const response = await apiClient.get<ApiResponse<MemberPageData>>(
    `/members?${query.toString()}`,
  );

  const pageData = response.data.data;
  const patchedContent = pageData.content.map((member) => ({
    ...member,
    grade: member.grade || "NONE",
  }));

  return {
    ...pageData,
    content: patchedContent,
  };
}

export async function createMember(request: MemberCreateRequest) {
  const response = await apiClient.post<ApiResponse<MemberResponse>>(
    "/members",
    request,
  );
  return response.data.data;
}

export async function updateMember(
  memberId: number,
  request: MemberUpdateRequest,
) {
  const response = await apiClient.put<ApiResponse<MemberResponse>>(
    `/members/${memberId}`,
    request,
  );
  return response.data.data;
}

export async function deleteMember(memberId: number) {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/members/${memberId}`,
  );
  return response.data;
}
