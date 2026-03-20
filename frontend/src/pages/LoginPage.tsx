import { useState } from "react";
import { login } from "../api/auth";
import { setAccessToken } from "../utils/storage";
import { getErrorMessage } from "../utils/http";

interface Props {
  onLoginSuccess: () => void;
  onMoveSignup: () => void;
}

export default function LoginPage({ onLoginSuccess, onMoveSignup }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      setErrorMessage("");
      const result = await login({ email, password });
      setAccessToken(result.accessToken);
      onLoginSuccess();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "로그인에 실패했습니다."));
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">플레이콕</h1>

        <div className="form-stack">
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

          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <button className="btn btn-primary" onClick={handleLogin}>
            로그인
          </button>

          <button className="signup-text" onClick={onMoveSignup}>
            회원가입으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
