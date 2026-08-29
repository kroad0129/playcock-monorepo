import { useState } from "react";
import { signup } from "../api/auth";
import { getErrorMessage } from "../utils/http";

interface Props {
  onMoveLogin: () => void;
}

export default function SignupPage({ onMoveLogin }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    try {
      await signup({ name, email, password });
      setMessage("회원가입이 완료되었습니다. 로그인해 주세요.");
    } catch (error) {
      setMessage(getErrorMessage(error, "회원가입에 실패했습니다."));
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>

        <div className="form-stack">
          <input
            className="input"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {message && <p className="muted">{message}</p>}

          <button className="btn btn-primary" onClick={handleSignup}>
            회원가입
          </button>
          <button className="signup-text" onClick={onMoveLogin}>
            로그인으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
