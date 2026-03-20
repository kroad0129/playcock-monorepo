export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
export type MemberType = "MEMBER" | "GUEST" | "ETC";

export interface MemberResponse {
  id: number;
  name: string;
  schoolName: string | null;
  generation: string | null;
  email: string | null;
  gender: Gender;
  phoneNumber: string | null;
  memberType: MemberType;
  active: boolean;
  note: string | null;
}

export interface MemberCreateRequest {
  name: string;
  schoolName?: string;
  generation?: string;
  email?: string;
  gender: Gender;
  phoneNumber?: string;
  memberType: MemberType;
  active: boolean;
  note?: string;
}

export interface MemberUpdateRequest {
  name: string;
  schoolName?: string;
  generation?: string;
  email?: string;
  gender: Gender;
  phoneNumber?: string;
  memberType: MemberType;
  active: boolean;
  note?: string;
}

export interface MemberPageData {
  content: MemberResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
