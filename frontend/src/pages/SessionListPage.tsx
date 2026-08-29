import { useEffect, useState } from "react";
import { createSession, getSessions } from "../api/session";
import { removeAccessToken } from "../utils/storage";
import type {
  SessionCreateRequest,
  SessionListItemResponse,
} from "../types/session";
import CreateSessionModal from "../components/session/CreateSessionModal";
import { getErrorMessage } from "../utils/http";

interface Props {
  userName?: string;
  onLogout: () => void;
  onSelectSession?: (sessionId: number) => void;
  onMoveMembers: () => void;
}

export default function SessionListPage({
  userName,
  onLogout,
  onSelectSession,
  onMoveMembers,
}: Props) {
  const [sessions, setSessions] = useState<SessionListItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const result = await getSessions();
      setSessions(result);
    } catch (error) {
      alert(getErrorMessage(error, "활동 목록 조회에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async (payload: SessionCreateRequest) => {
    try {
      await createSession(payload);
      await loadSessions();
    } catch (error) {
      alert(getErrorMessage(error, "활동 생성에 실패했습니다."));
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="top-row">
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>
              활동 목록
            </h1>
            <p className="muted" style={{ marginTop: 8 }}>
              {userName
                ? `${userName}님, 운영할 활동을 선택하세요.`
                : "활동을 선택하세요."}
            </p>
          </div>

          <div className="top-actions">
            <button className="btn" onClick={onMoveMembers}>
              부원 관리
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setOpenCreate(true)}
            >
              활동 생성
            </button>
            <button
              className="btn"
              onClick={() => {
                removeAccessToken();
                onLogout();
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body">불러오는 중...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="card">
            <div className="card-body">생성된 활동이 없습니다.</div>
          </div>
        ) : (
          <div className="grid-2">
            {sessions.map((session: any) => {
              const isClosed = session.status !== "IN_PROGRESS";
              const statusLabel =
                session.status === "IN_PROGRESS" ? "진행중" : "종료됨";

              return (
                <div
                  key={session.sessionId}
                  className="card"
                  style={{
                    cursor: isClosed ? "not-allowed" : "pointer",
                    opacity: isClosed ? 0.6 : 1,
                  }}
                  onClick={() => {
                    if (!isClosed && onSelectSession)
                      onSelectSession(session.sessionId);
                  }}
                >
                  <div className="card-body">
                    <div
                      className="row-between"
                      style={{ alignItems: "flex-start", marginBottom: 12 }}
                    >
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                        {session.title}
                      </h3>
                      <span
                        className={`badge ${session.status === "IN_PROGRESS" ? "badge-green" : "badge-slate"}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div
                      className="muted"
                      style={{
                        fontSize: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div>장소: {session.location || "-"}</div>
                      <div>비고: {session.note || "-"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreateSessionModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreateSession}
        />
      </div>
    </div>
  );
}
