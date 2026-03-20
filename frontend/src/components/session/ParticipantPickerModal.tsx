import { useEffect, useMemo, useState } from "react";
import { getMembers } from "../../api/member";
import type { MemberResponse } from "../../types/member";
import { getErrorMessage } from "../../utils/http";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (memberIds: number[]) => Promise<boolean>;
}

export default function ParticipantPickerModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    loadMembers();
  }, [open]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const result = await getMembers({ page: 0, size: 100, sort: "id,desc" });
      setMembers(result.content);
    } catch (error) {
      alert(getErrorMessage(error, "부원 목록 조회에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.schoolName, m.generation, m.email].some((v) =>
        (v || "").toLowerCase().includes(q),
      ),
    );
  }, [members, keyword]);

  const toggle = (memberId: number) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">참가자 추가</h2>
          <button
            className="text-sm border rounded-lg px-3 py-1"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <input
          className="w-full border rounded-xl px-4 py-3 mb-4"
          placeholder="이름 / 학교 / 기수 / 이메일 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="max-h-[420px] overflow-auto border rounded-xl">
          {loading ? (
            <div className="p-4 text-sm text-slate-500">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">
              조회된 부원가 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(member.id)}
                    onChange={() => toggle(member.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-slate-500">
                      {member.schoolName || "-"} · {member.generation || "-"} ·{" "}
                      {member.memberType}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{member.gender}</div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            선택된 부원 {selectedIds.length}명
          </div>
          <button
            className="px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-50"
            disabled={selectedIds.length === 0}
            onClick={async () => {
              const ok = await onSubmit(selectedIds);
              if (ok) onClose();
            }}
          >
            참가자 추가
          </button>
        </div>
      </div>
    </div>
  );
}
