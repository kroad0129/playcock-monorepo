import { useEffect, useState } from "react";
import type {
  Gender,
  MemberResponse,
  MemberType,
  MemberUpdateRequest,
} from "../../types/member";

interface Props {
  open: boolean;
  member: MemberResponse | null;
  onClose: () => void;
  onSubmit: (memberId: number, payload: MemberUpdateRequest) => Promise<void>;
}

export default function MemberEditModal({
  open,
  member,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<MemberUpdateRequest>({
    name: "",
    schoolName: "",
    generation: "",
    email: "",
    gender: "UNKNOWN" as Gender,
    phoneNumber: "",
    memberType: "MEMBER" as MemberType,
    active: true,
    note: "",
  });

  useEffect(() => {
    if (!member) return;
    setForm({
      name: member.name,
      schoolName: member.schoolName || "",
      generation: member.generation || "",
      email: member.email || "",
      gender: member.gender,
      phoneNumber: member.phoneNumber || "",
      memberType: member.memberType,
      active: member.active,
      note: member.note || "",
    });
  }, [member]);

  if (!open || !member) return null;

  const update = (key: keyof MemberUpdateRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(member.id, form);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div style={{ fontWeight: 700, fontSize: 18 }}>부원 수정</div>
        </div>

        <div className="modal-body">
          <div className="form-grid-2">
            <input
              className="input"
              placeholder="이름"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <input
              className="input"
              placeholder="학교"
              value={form.schoolName}
              onChange={(e) => update("schoolName", e.target.value)}
            />
            <input
              className="input"
              placeholder="기수"
              value={form.generation}
              onChange={(e) => update("generation", e.target.value)}
            />
            <input
              className="input"
              placeholder="이메일"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <select
              className="select"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value as Gender)}
            >
              <option value="MALE">남자</option>
              <option value="FEMALE">여자</option>
            </select>
            <select
              className="select"
              value={form.memberType}
              onChange={(e) =>
                update("memberType", e.target.value as MemberType)
              }
            >
              <option value="MEMBER">부원</option>
              <option value="GUEST">게스트</option>
              <option value="ETC">기타</option>
            </select>
            <input
              className="input"
              style={{ gridColumn: "1 / span 2" }}
              placeholder="전화번호"
              value={form.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
            />
            <textarea
              className="textarea"
              style={{ gridColumn: "1 / span 2" }}
              placeholder="비고"
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            취소
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
