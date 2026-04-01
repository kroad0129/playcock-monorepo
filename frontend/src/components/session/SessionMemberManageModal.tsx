import { useEffect, useMemo, useState } from "react";
import { getMembers } from "../../api/member";
import { addParticipants, removeParticipant } from "../../api/session";
import { getErrorMessage } from "../../utils/http";
import type { Gender, MemberResponse, MemberType } from "../../types/member";
import type {
  MatchDto,
  ParticipantDto,
  WaitingTeamDto,
} from "../../types/dashboard";

interface Props {
  open: boolean;
  sessionId: number;
  listedParticipants: ParticipantDto[];
  removedParticipants: ParticipantDto[];
  waitingTeams: WaitingTeamDto[];
  matches: MatchDto[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

type ActiveParticipantMap = Record<
  number,
  {
    participantId: number;
    status: "LISTED" | "WAITING" | "PLAYING";
  }
>;

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

const translateStatus = (
  activeInfo: ActiveParticipantMap[number] | undefined,
  isRemoved: boolean,
) => {
  if (activeInfo) {
    switch (activeInfo.status) {
      case "LISTED":
        return "참가";
      case "WAITING":
        return "대기명단";
      case "PLAYING":
        return "경기 진행중";
    }
  }
  if (isRemoved) {
    return "제외됨";
  }
  return "미참가";
};

export default function SessionMemberManageModal({
  open,
  sessionId,
  listedParticipants,
  removedParticipants,
  waitingTeams,
  matches,
  onClose,
  onSaved,
}: Props) {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listSearch, setListSearch] = useState("");

  const activeParticipantMap = useMemo(() => {
    const map: ActiveParticipantMap = {};

    listedParticipants.forEach((p) => {
      map[p.memberId] = { participantId: p.participantId, status: "LISTED" };
    });

    waitingTeams.forEach((team) => {
      team.members.forEach((p) => {
        map[p.memberId] = { participantId: p.participantId, status: "WAITING" };
      });
    });

    matches.forEach((match) => {
      match.participants.forEach((p) => {
        map[p.memberId] = { participantId: p.participantId, status: "PLAYING" };
      });
    });

    return map;
  }, [listedParticipants, waitingTeams, matches]);

  const initialCheckedIds = useMemo(() => {
    return Object.keys(activeParticipantMap).map(Number);
  }, [activeParticipantMap]);

  const filteredMembers = useMemo(() => {
    const sortedMembers = [...members].sort((a, b) => {
      const aIsActive = a.id in activeParticipantMap;
      const bIsActive = b.id in activeParticipantMap;
      const aIsRemoved = removedParticipants.some((p) => p.memberId === a.id);
      const bIsRemoved = removedParticipants.some((p) => p.memberId === b.id);

      const aIsTop = aIsActive || aIsRemoved;
      const bIsTop = bIsActive || bIsRemoved;

      if (aIsTop && !bIsTop) return -1;
      if (!bIsTop && aIsTop) return 1;

      return 0;
    });

    const keyword = listSearch.trim().toLowerCase();
    if (!keyword) return sortedMembers;

    return sortedMembers.filter((member) =>
      member.name.toLowerCase().includes(keyword),
    );
  }, [members, listSearch, activeParticipantMap, removedParticipants]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const page = await getMembers({ page: 0, size: 200, sort: "name,asc" });
        setMembers(page.content);
        setCheckedIds(initialCheckedIds);
      } catch (error: any) {
        const status = error?.response?.status;

        if (status !== 401 && status !== 403 && status < 500) {
          alert(getErrorMessage(error, "부원 목록 조회에 실패했습니다."));
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, initialCheckedIds]);

  const toggleCheck = (memberId: number, disabled: boolean) => {
    if (disabled || saving) return;

    setCheckedIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const initialSet = new Set(initialCheckedIds);
      const currentSet = new Set(checkedIds);

      const addMemberIds = checkedIds.filter((id) => !initialSet.has(id));

      const removeTargets = initialCheckedIds
        .filter((id) => !currentSet.has(id))
        .map((memberId) => {
          const info = activeParticipantMap[memberId];
          return {
            memberId,
            participantId: info.participantId,
            status: info.status,
          };
        });

      const invalidRemove = removeTargets.find(
        (item) => item.status !== "LISTED",
      );

      if (invalidRemove) {
        alert("대기 중이거나 경기 중인 부원는 제외할 수 없습니다.");
        return;
      }

      if (addMemberIds.length > 0) {
        await addParticipants(sessionId, addMemberIds);
      }

      for (const item of removeTargets) {
        await removeParticipant(sessionId, item.participantId);
      }

      await onSaved();
      onClose();
    } catch (error: any) {
      const status = error?.response?.status;

      if (status !== 401 && status !== 403 && status < 500) {
        alert(getErrorMessage(error, "세션 부원 수정에 실패했습니다."));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 900 }}>
        <div className="modal-header">
          <div style={{ fontWeight: 700, fontSize: 18 }}>세션 부원 수정</div>
          <div className="muted" style={{ marginTop: 4 }}>
            체크하면 세션 참가, 체크 해제하면 세션 제외
          </div>
        </div>

        <div className="modal-body">
          <div className="list-search-box-old" style={{ marginBottom: 12 }}>
            <input
              className="input list-search-input-old"
              placeholder="부원 이름으로 검색..."
              value={listSearch}
              onChange={(event) => setListSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <div>불러오는 중...</div>
          ) : (
            <div
              className="form-stack"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              {filteredMembers.map((member) => {
                const activeInfo = activeParticipantMap[member.id];
                const isChecked = checkedIds.includes(member.id);
                const disabled =
                  activeInfo?.status === "WAITING" ||
                  activeInfo?.status === "PLAYING";

                const isRemoved = removedParticipants.some(
                  (p) => p.memberId === member.id,
                );

                const statusText = translateStatus(activeInfo, isRemoved);

                return (
                  <label
                    key={member.id}
                    className={`member-row ${disabled ? "member-row-disabled" : ""}`}
                  >
                    <div className="row">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={disabled || saving}
                        onChange={() =>
                          toggleCheck(member.id, disabled || saving)
                        }
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div className="muted">
                          {translateGender(member.gender)} /{" "}
                          {translateMemberType(member.memberType)} /{" "}
                          {member.schoolName || "-"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`badge ${
                          statusText === "참가"
                            ? "badge-blue"
                            : statusText === "대기명단"
                              ? "badge-amber"
                              : statusText === "경기 진행중"
                                ? "badge-green"
                                : statusText === "제외됨"
                                  ? "badge-slate"
                                  : ""
                        }`}
                      >
                        {statusText}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={saving}>
            취소
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "저장 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
