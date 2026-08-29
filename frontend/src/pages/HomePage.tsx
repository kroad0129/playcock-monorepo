import { removeAccessToken } from "../utils/storage";

interface Props {
  userName?: string;
  onLogout: () => void;
}

export default function HomePage({ userName, onLogout }: Props) {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold">Playcock 관리자 홈</h1>
        <p className="mt-2 text-slate-600">
          {userName ? `${userName}님 환영합니다.` : "로그인되었습니다."}
        </p>

        <button
          className="mt-6 px-4 py-2 rounded-xl bg-slate-900 text-white"
          onClick={() => {
            removeAccessToken();
            onLogout();
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
