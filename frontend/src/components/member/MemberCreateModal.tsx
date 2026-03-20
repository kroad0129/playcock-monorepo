import { useState } from "react";
import type {
  Gender,
  MemberCreateRequest,
  MemberType,
} from "../../types/member";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MemberCreateRequest) => Promise<void>;
}

export default function MemberCreateModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<MemberCreateRequest>({
    name: "",
    schoolName: "",
    generation: "",
    email: "",
    gender: "MALE" as Gender,
    phoneNumber: "",
    memberType: "MEMBER" as MemberType,
    active: true,
    note: "",
  });

  if (!open) return null;

  const update = (key: keyof MemberCreateRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(form);
    setForm({
      name: "",
      schoolName: "",
      generation: "",
      email: "",
      gender: "MALE",
      phoneNumber: "",
      memberType: "MEMBER",
      active: true,
      note: "",
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div style={{ fontWeight: 700, fontSize: 18 }}>부원 추가</div>
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
