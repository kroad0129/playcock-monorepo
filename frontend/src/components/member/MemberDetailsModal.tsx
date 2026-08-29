import type {
  Gender,
  Grade,
  MemberResponse,
  MemberType,
} from "../../types/member";

interface Props {
  member: MemberResponse | null;
  onClose: () => void;
  onEdit: (member: MemberResponse) => void;
  onDelete: (memberId: number) => void;
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

const translateGrade = (grade: Grade) => {
  if (grade === "NONE") return "없음";
  return grade;
};

export default function MemberDetailsModal({
  member,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!member) return null;

  const handleEdit = () => {
    onEdit(member);
  };

  const handleDelete = () => {
    onDelete(member.id);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 720 }}>
        <div
          className="modal-header"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div style={{ fontWeight: 700, fontSize: 18 }}>부원 정보</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-danger" onClick={handleDelete}>
              삭제
            </button>
            <button className="btn btn-primary" onClick={handleEdit}>
              수정
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="form-grid-2">
            <div className="form-group">
              <label>이름</label>
              <p>{member.name}</p>
            </div>
            <div className="form-group">
              <label>성별</label>
              <p>{translateGender(member.gender)}</p>
            </div>
            <div className="form-group">
              <label>학교</label>
              <p>{member.schoolName || "-"}</p>
            </div>
            <div className="form-group">
              <label>기수</label>
              <p>{member.generation || "-"}</p>
            </div>
            <div className="form-group">
              <label>유형</label>
              <p>{translateMemberType(member.memberType)}</p>
            </div>
            <div className="form-group">
              <label>급수</label>
              <p>{translateGrade(member.grade)}</p>
            </div>
            <div className="form-group">
              <label>이메일</label>
              <p>{member.email || "-"}</p>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / span 2" }}>
              <label>전화번호</label>
              <p>{member.phoneNumber || "-"}</p>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / span 2" }}>
              <label>활성 상태</label>
              <p>{member.active ? "활성" : "비활성"}</p>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / span 2" }}>
              <label>비고</label>
              <p style={{ whiteSpace: "pre-wrap" }}>{member.note || "-"}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
