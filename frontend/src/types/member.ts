export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
export type MemberType = "MEMBER" | "GUEST" | "ETC";
export type Grade = "NONE" | "A" | "B" | "C" | "D" | "E" | "F";

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
  grade: Grade;
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
  grade: Grade;
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
  grade: Grade;
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
