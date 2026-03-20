import type { Gender, MemberResponse, MemberType } from "../../types/member";

interface Props {
  members: MemberResponse[];
  onViewDetails: (member: MemberResponse) => void;
}

const translateGender = (gender: Gender) => {
  switch (gender) {
    case "MALE":
      return "남자";
    case "FEMALE":
      return "여자";
    case "OTHER":
      return "기타";
    case "UNKNOWN":
      return "미상";
  }
};

const translateMemberType = (memberType: MemberType) => {
  switch (memberType) {
    case "MEMBER":
      return "부원";
    case "GUEST":
      return "게스트";
    case "ETC":
      return "기타";
  }
};

export default function MemberTable({ members, onViewDetails }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>이름</th>
            <th>학교</th>
            <th>기수</th>
            <th>성별</th>
            <th>유형</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.schoolName || "-"}</td>
              <td>{member.generation || "-"}</td>
              <td>{translateGender(member.gender)}</td>
              <td>{translateMemberType(member.memberType)}</td>
              <td>
                <button
                  className="btn"
                  onClick={() => onViewDetails(member)}
                >
                  자세히
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
