import { useEffect, useState } from "react";
import type { Gender, MemberType } from "../../types/member";

interface Props {
  onSearch: (filters: {
    name?: string;
    schoolName?: string;
    generation?: string;
    gender?: Gender;
    memberType?: MemberType;
  }) => void;
}

export default function MemberSearchBar({ onSearch }: Props) {
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [generation, setGeneration] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [memberType, setMemberType] = useState<MemberType | "">("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch({
        name: name || undefined,
        schoolName: schoolName || undefined,
        generation: generation || undefined,
        gender: gender || undefined,
        memberType: memberType || undefined,
      });
    }, 300); // 300ms 디바운스

    return () => {
      clearTimeout(handler);
    };
  }, [name, schoolName, generation, gender, memberType, onSearch]);

  return (
    <div className="search-bar">
      <div className="search-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <input
          className="input"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="학교"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />
        <input
          className="input"
          placeholder="기수"
          value={generation}
          onChange={(e) => setGeneration(e.target.value)}
        />
        <select
          className="input"
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender | "")}
        >
          <option value="">성별 (전체)</option>
          <option value="MALE">남자</option>
          <option value="FEMALE">여자</option>
        </select>
        <select
          className="input"
          value={memberType}
          onChange={(e) => setMemberType(e.target.value as MemberType | "")}
        >
          <option value="">유형 (전체)</option>
          <option value="MEMBER">부원</option>
          <option value="GUEST">게스트</option>
          <option value="ETC">기타</option>
        </select>
      </div>
    </div>
  );
}
