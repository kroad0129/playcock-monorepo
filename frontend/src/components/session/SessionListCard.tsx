import type { SessionListItemResponse } from "../../types/session";

interface Props {
  session: SessionListItemResponse;
  onClick: (sessionId: number) => void;
}

export default function SessionListCard({ session, onClick }: Props) {
  return (
    <button className="session-card" onClick={() => onClick(session.sessionId)}>
      <div className="row-between">
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{session.title}</div>
          <div className="muted" style={{ marginTop: 6 }}>
            {session.location || "장소 미지정"}
          </div>
        </div>
        <span
          className={`badge ${session.status === "IN_PROGRESS" ? "badge-green" : "badge-slate"}`}
        >
          {session.status}
        </span>
      </div>

      <div className="row" style={{ marginTop: 14, flexWrap: "wrap" }}>
        <span className="badge">{session.category}</span>
        {session.startedAt && (
          <span className="muted">
            시작: {new Date(session.startedAt).toLocaleString()}
          </span>
        )}
      </div>
    </button>
  );
}
