import { useState } from "react";
import type {
  SessionCategory,
  SessionCreateRequest,
} from "../../types/session";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: SessionCreateRequest) => Promise<void>;
}

export default function CreateSessionModal({ open, onClose, onSubmit }: Props) {
  const [category, setCategory] = useState<SessionCategory>("REGULAR");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    await onSubmit({
      category,
      location,
      note,
    });
    setCategory("REGULAR");
    setLocation("");
    setNote("");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div style={{ fontWeight: 700, fontSize: 18 }}>활동 생성</div>
        </div>

        <div className="modal-body">
          <div className="form-stack">
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value as SessionCategory)}
            >
              <option value="REGULAR">정기운동</option>
              <option value="FLASH">번개</option>
            </select>

            <input
              className="input"
              placeholder="장소"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <textarea
              className="textarea"
              placeholder="비고"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            취소
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
