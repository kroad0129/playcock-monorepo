import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getSessionDashboard } from "../api/dashboard";
import type { StompSubscription } from "@stomp/stompjs";
import { activateSocket, subscribeSessionTopic } from "../api/socket";
import {
  cancelWaitingTeam,
  createWaitingTeam,
  endMatch,
  endSession,
  startMatch,
} from "../api/session";
import type {
  MatchDto,
  ParticipantDto,
  SessionDashboardResponse,
  WaitingTeamDto,
} from "../types/dashboard";
import { getErrorMessage } from "../utils/http";
import SessionMemberManageModal from "../components/session/SessionMemberManageModal";

interface Props {
  sessionId: number;
  onBack: () => void;
}

type GenderFilter = "ALL" | "MALE" | "FEMALE";
type SortMode = "NONE" | "WAIT_ASC" | "MATCH_ASC";

function formatShortWaiting(serverNow: Date | null, listedAt: string | null) {
  if (!serverNow || !listedAt) return "-";

  const diffSec = Math.max(
    0,
    Math.floor((serverNow.getTime() - new Date(listedAt).getTime()) / 1000),
  );

  if (diffSec < 60) return `${diffSec}초`;
  return `${Math.floor(diffSec / 60)}분`;
}

function formatClockDuration(serverNow: Date | null, startedAt: string | null) {
  if (!serverNow || !startedAt) return "-";

  const diffSec = Math.max(
    0,
    Math.floor((serverNow.getTime() - new Date(startedAt).getTime()) / 1000),
  );

  const min = Math.floor(diffSec / 60);
  const sec = diffSec % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function getGenderValue(gender: string) {
  const value = gender.toUpperCase();
  if (value.includes("FEMALE")) return "FEMALE";
  if (value.includes("MALE")) return "MALE";
  return "OTHER";
}

function getListTint(gender: string) {
  return getGenderValue(gender) === "FEMALE" ? "#fff0f7" : "#eef3ff";
}

function matchTypeKo(type: string) {
  const up = type.toUpperCase();
  if (up === "MALE_DOUBLE") return "남자복식";
  if (up === "FEMALE_DOUBLE") return "여자복식";
  if (up === "MIXED_DOUBLE") return "혼합복식";
  return type;
}

function SectionCard({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="section-card section-card-old">
      <div className="section-header section-header-old row-between">
        <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
        {typeof count === "number" && <span className="pill-old">{count}</span>}
      </div>
      <div className="section-body section-body-old">{children}</div>
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`chip-old ${active ? "chip-old-active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ListedParticipantCard({
  item,
  serverNow,
  checked,
  disabled,
  onToggle,
}: {
  item: ParticipantDto;
  serverNow: Date | null;
  checked: boolean;
  disabled: boolean;
  onToggle: (participantId: number) => void;
}) {
  return (
    <div
      className={`list-item list-item-old ${
        checked ? "list-item-old-selected" : ""
      }`}
      style={{ background: getListTint(item.gender) }}
      onClick={() => {
        if (!disabled) onToggle(item.participantId);
      }}
    >
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="name-old">{item.memberName}</div>
            <div className="meta-old" style={{ marginTop: 4 }}>
              경기 {item.totalMatchCount}회 · 대기{" "}
              {formatShortWaiting(serverNow, item.listedAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="small-old mono-old" style={{ marginTop: 6 }}>
        남복 {item.maleDoubleCount} / 여복 {item.femaleDoubleCount} / 혼복{" "}
        {item.mixedDoubleCount}
      </div>
    </div>
  );
}

function WaitingTeamCard({
  team,
  serverNow,
  disabled,
  onCancel,
  onStart,
}: {
  team: WaitingTeamDto;
  serverNow: Date | null;
  disabled: boolean;
  onCancel: (waitingTeamId: number) => void;
  onStart: (waitingTeamId: number) => void;
}) {
  return (
    <div className="waiting-item waiting-item-old">
      <div
        className="wait-title-old"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <span>대기 #{team.queueOrder}</span>
        <span>{formatClockDuration(serverNow, team.createdAt)}</span>
      </div>

      <div className="sub-grid-2" style={{ marginTop: 10 }}>
        {team.members.map((member) => (
          <div
            key={member.participantId}
            className="small-tile small-tile-old"
            style={{ background: getListTint(member.gender) }}
          >
            <div className="name-old">{member.memberName}</div>
          </div>
        ))}
      </div>

      <div className="two-btn-row-old">
        <button
          className="btn"
          disabled={!team.canCancel || disabled}
          onClick={() => onCancel(team.waitingTeamId)}
        >
          팀 해체
        </button>
        <button
          className="btn btn-primary"
          disabled={!team.canStartMatch || disabled}
          onClick={() => onStart(team.waitingTeamId)}
        >
          경기 시작
        </button>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  serverNow,
  disabled,
  onEnd,
}: {
  match: MatchDto;
  serverNow: Date | null;
  disabled: boolean;
  onEnd: (matchId: number) => void;
}) {
  return (
    <div className="match-item match-item-old">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div className="wait-title-old">
          <span>경기 #{match.matchNumber}</span>
          <span className="meta-old" style={{ marginLeft: 8 }}>
            {matchTypeKo(match.matchType)}
          </span>
        </div>
        <span>{formatClockDuration(serverNow, match.startedAt)}</span>
      </div>

      <div className="sub-grid-2" style={{ marginTop: 10 }}>
        {match.participants.map((participant) => (
          <div
            key={participant.participantId}
            className="small-tile small-tile-old"
            style={{ background: getListTint(participant.gender) }}
          >
            <div className="name-old">{participant.memberName}</div>
          </div>
        ))}
      </div>

      <div
        className="toolbar"
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() => onEnd(match.matchId)}
          disabled={disabled}
        >
          경기 종료
        </button>
      </div>
    </div>
  );
}

export default function SessionDashboardPage({ sessionId, onBack }: Props) {
  const [dashboard, setDashboard] = useState<SessionDashboardResponse | null>(
    null,
  );
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [openMemberManage, setOpenMemberManage] = useState(false);
  const [tick, setTick] = useState(0);
  const [selectedListedIds, setSelectedListedIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("NONE");
  const [listSearch, setListSearch] = useState("");

  const subscriptionRef = useRef<StompSubscription | null>(null);

  const loadDashboard = async () => {
    setDashboardLoading(true);
    try {
      const result = await getSessionDashboard(sessionId);

      setDashboard(result);
      setSelectedListedIds((prev) =>
        prev.filter((id) =>
          result.listedParticipants.some((p) => p.participantId === id),
        ),
      );
      setTick(0);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status !== 401 && status !== 403 && status < 500) {
        alert(getErrorMessage(error, "세션 대시보드 조회에 실패했습니다."));
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [sessionId]);

  useEffect(() => {
    const client = activateSocket();

    const timer = window.setInterval(() => {
      if (!client.connected || subscriptionRef.current) return;

      const subscription = subscribeSessionTopic(sessionId, async () => {
        await loadDashboard();
      });

      if (subscription) {
        subscriptionRef.current = subscription;
        window.clearInterval(timer);
      }
    }, 300);

    return () => {
      window.clearInterval(timer);
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const serverNow = useMemo(() => {
    if (!dashboard?.serverNow) return null;

    const base = new Date(dashboard.serverNow);
    return new Date(base.getTime() + tick * 1000);
  }, [dashboard?.serverNow, tick]);

  const listedParticipants = useMemo(() => {
    if (!dashboard) return [];

    let result = [...dashboard.listedParticipants];

    if (genderFilter === "MALE") {
      result = result.filter((item) => getGenderValue(item.gender) === "MALE");
    }

    if (genderFilter === "FEMALE") {
      result = result.filter(
        (item) => getGenderValue(item.gender) === "FEMALE",
      );
    }

    const keyword = listSearch.trim().toLowerCase();
    if (keyword) {
      result = result.filter((item) =>
        [item.memberName, item.gender]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword)),
      );
    }

    if (sortMode === "WAIT_ASC") {
      result.sort((a, b) => {
        const aTime = a.listedAt ? new Date(a.listedAt).getTime() : 0;
        const bTime = b.listedAt ? new Date(b.listedAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    if (sortMode === "MATCH_ASC") {
      result.sort((a, b) => a.totalMatchCount - b.totalMatchCount);
    }

    return result;
  }, [dashboard, genderFilter, listSearch, sortMode]);

  const selectedNames = useMemo(() => {
    if (!dashboard) return [];

    return selectedListedIds
      .map((id) =>
        dashboard.listedParticipants.find((item) => item.participantId === id),
      )
      .filter((item): item is ParticipantDto => item !== undefined)
      .map((item) => item.memberName);
  }, [dashboard, selectedListedIds]);

  const toggleListed = (participantId: number) => {
    if (actionLoading) return;

    setSelectedListedIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId],
    );
  };

  const runAction = async (fn: () => Promise<unknown>) => {
    if (actionLoading) return false;

    setActionLoading(true);
    try {
      await fn();
      await loadDashboard();
      return true;
    } catch (error: any) {
      const status = error?.response?.status;

      if (status !== 401 && status !== 403 && status < 500) {
        alert(getErrorMessage(error));
      }

      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateWaitingTeam = async () => {
    if (selectedListedIds.length !== 4) {
      alert("대기팀은 LISTED 참가자 4명을 선택해야 합니다.");
      return;
    }

    await runAction(() => createWaitingTeam(sessionId, selectedListedIds));
  };

  if (dashboardLoading && !dashboard) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <div className="card-body">불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <div className="card-body">데이터를 불러오지 못했습니다.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page page-old-tone">
        <div className="container container-wide-old">
          <div className="top-shell-old">
            <div>
              <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 900 }}>
                {dashboard.title}
              </h1>
            </div>

            <div className="top-actions">
              <button
                className="btn btn-danger"
                disabled={actionLoading}
                onClick={() => {
                  if (!dashboard.canEndSession) {
                    alert("종료할 수 없는 경기가 남아있습니다.");
                    return;
                  }
                  if (!window.confirm("활동을 종료할까요?")) return;
                  runAction(() => endSession(sessionId));
                }}
              >
                활동 종료
              </button>
              <button
                className="btn"
                onClick={loadDashboard}
                disabled={dashboardLoading || actionLoading}
              >
                새로고침
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setOpenMemberManage(true)}
                disabled={actionLoading}
              >
                부원 수정
              </button>
              <button className="btn" onClick={onBack} disabled={actionLoading}>
                뒤로가기
              </button>
            </div>
          </div>

          <div className="dashboard-grid-old">
            <SectionCard title="부원 목록" count={listedParticipants.length}>
              <div className="dashboard-topbar-old">
                <div className="filters-old">
                  <div className="filter-row-old">
                    <div className="filter-label-old">성별</div>
                    <Chip
                      active={genderFilter === "ALL"}
                      onClick={() => setGenderFilter("ALL")}
                    >
                      전체
                    </Chip>
                    <Chip
                      active={genderFilter === "MALE"}
                      onClick={() => setGenderFilter("MALE")}
                    >
                      남자
                    </Chip>
                    <Chip
                      active={genderFilter === "FEMALE"}
                      onClick={() => setGenderFilter("FEMALE")}
                    >
                      여자
                    </Chip>
                  </div>

                  <div className="filter-row-old">
                    <div className="filter-label-old">정렬</div>
                    <Chip
                      active={sortMode === "NONE"}
                      onClick={() => setSortMode("NONE")}
                    >
                      기본
                    </Chip>
                    <Chip
                      active={sortMode === "WAIT_ASC"}
                      onClick={() => setSortMode("WAIT_ASC")}
                    >
                      대기순
                    </Chip>
                    <Chip
                      active={sortMode === "MATCH_ASC"}
                      onClick={() => setSortMode("MATCH_ASC")}
                    >
                      경기수
                    </Chip>
                  </div>
                </div>

                <div className="action-box-old">
                  <div style={{ fontWeight: 900, fontSize: 13 }}>
                    선택 {selectedListedIds.length}명
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateWaitingTeam}
                    disabled={actionLoading}
                  >
                    대기팀 생성
                  </button>
                  <div className="picked-names-old">
                    {selectedNames.length === 0
                      ? "없음"
                      : selectedNames.join(", ")}
                  </div>
                </div>
              </div>

              <div className="list-search-box-old">
                <input
                  className="input list-search-input-old"
                  placeholder="부원 이름 또는 성별 검색..."
                  value={listSearch}
                  onChange={(event) => setListSearch(event.target.value)}
                />
              </div>

              {listedParticipants.length === 0 ? (
                <div className="muted">LIST 참가자가 없습니다.</div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 8,
                    maxHeight: "calc(100vh - 380px)",
                    overflowY: "auto",
                  }}
                >
                  {listedParticipants.map((item) => (
                    <ListedParticipantCard
                      key={item.participantId}
                      item={item}
                      serverNow={serverNow}
                      checked={selectedListedIds.includes(item.participantId)}
                      disabled={actionLoading}
                      onToggle={toggleListed}
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="대기" count={dashboard.waitingTeams.length}>
              {dashboard.waitingTeams.length === 0 ? (
                <div className="muted">대기팀이 없습니다.</div>
              ) : (
                <div
                  style={{
                    maxHeight: "calc(100vh - 280px)",
                    overflowY: "auto",
                  }}
                >
                  {dashboard.waitingTeams.map((team) => (
                    <WaitingTeamCard
                      key={team.waitingTeamId}
                      team={team}
                      serverNow={serverNow}
                      disabled={actionLoading}
                      onCancel={(waitingTeamId) => {
                        runAction(() =>
                          cancelWaitingTeam(sessionId, waitingTeamId),
                        );
                      }}
                      onStart={(waitingTeamId) =>
                        runAction(() => startMatch(sessionId, waitingTeamId))
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="경기 중" count={dashboard.matches.length}>
              {dashboard.matches.length === 0 ? (
                <div className="muted">진행 중인 경기가 없습니다.</div>
              ) : (
                <div
                  style={{
                    maxHeight: "calc(100vh - 280px)",
                    overflowY: "auto",
                  }}
                >
                  {dashboard.matches.map((match) => (
                    <MatchCard
                      key={match.matchId}
                      match={match}
                      serverNow={serverNow}
                      disabled={actionLoading}
                      onEnd={(matchId) =>
                        runAction(() => endMatch(sessionId, matchId))
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      <SessionMemberManageModal
        open={openMemberManage}
        sessionId={dashboard.sessionId}
        listedParticipants={dashboard.listedParticipants}
        removedParticipants={dashboard.removedParticipants}
        waitingTeams={dashboard.waitingTeams}
        matches={dashboard.matches}
        onClose={() => setOpenMemberManage(false)}
        onSaved={loadDashboard}
      />
    </>
  );
}
