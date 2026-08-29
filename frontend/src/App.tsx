import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SessionListPage from "./pages/SessionListPage";
import MemberManagementPage from "./pages/MemberManagementPage";
import SessionDashboardPage from "./pages/SessionDashboardPage";
import { getAccessToken, removeAccessToken } from "./utils/storage";
import { getMyInfo } from "./api/auth";

type ViewType = "login" | "signup" | "home" | "members" | "dashboard";

function App() {
  const [view, setView] = useState<ViewType>("login");
  const [userName, setUserName] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );

  const loadMyInfo = async () => {
    try {
      const me = await getMyInfo();
      setUserName(me.name);
      setView("home");
    } catch (error) {
      removeAccessToken();
      setView("login");
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      loadMyInfo();
    }
  }, []);

  if (view === "login") {
    return (
      <LoginPage
        onLoginSuccess={loadMyInfo}
        onMoveSignup={() => setView("signup")}
      />
    );
  }

  if (view === "signup") {
    return <SignupPage onMoveLogin={() => setView("login")} />;
  }

  if (view === "members") {
    return <MemberManagementPage onBack={() => setView("home")} />;
  }

  if (view === "dashboard" && selectedSessionId !== null) {
    return (
      <SessionDashboardPage
        sessionId={selectedSessionId}
        onBack={() => setView("home")}
      />
    );
  }

  return (
    <SessionListPage
      userName={userName}
      onLogout={() => setView("login")}
      onMoveMembers={() => setView("members")}
      onSelectSession={(sessionId) => {
        setSelectedSessionId(sessionId);
        setView("dashboard");
      }}
    />
  );
}

export default App;
