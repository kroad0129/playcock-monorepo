# PLAYCOCK Frontend

PLAYCOCK 운영자가 회원과 운동 세션을 관리하고, 참가자·대기 팀·진행 중 경기 상태를 확인하는 React 애플리케이션입니다.

- 프로젝트 전체 설명: [../README.md](../README.md)
- API 명세: [../docs/API.md](../docs/API.md)
- 아키텍처: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

## 기술 구성

- React 19
- TypeScript 5.9
- Vite 8
- Axios
- STOMP.js
- SockJS
- ESLint

## 화면과 기능

| 화면 | 기능 |
| --- | --- |
| 로그인·가입 | 운영 계정 생성, JWT 로그인 |
| 세션 목록 | 진행할 운동 세션 생성 및 선택 |
| 회원 관리 | 회원 검색, 추가, 상세 조회와 수정 |
| 운영 대시보드 | 참가자 명단, 대기 팀, 진행 경기 관리 |

클라이언트는 복잡한 라우팅 계층보다 현재 운영 화면을 전환하는 단순한 구조를 사용합니다. API 요청은 `src/api`, 운영 UI는 회원 및 세션 관련 컴포넌트와 페이지로 나뉩니다.

## 실행 방법

### 요구 사항

- Node.js 20 이상 권장
- npm
- 실행 중인 PLAYCOCK backend

### 환경 변수

로컬에서 기존 팀 환경 값을 덮어쓰려면 `frontend/.env.local`을 만듭니다.

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

`VITE_API_BASE_URL`은 REST API의 `/api` 경로까지 포함하고, `VITE_WS_URL`은 백엔드의 `/ws` endpoint를 가리켜야 합니다.

저장소의 `.env.development`와 `.env.production`에는 개발 당시 로컬 네트워크 및 배포 endpoint가 남아 있습니다. 현재 환경에서는 `.env.local` 또는 배포 플랫폼의 환경 변수로 덮어쓰는 것을 권장합니다.

### 개발 서버

```bash
npm ci
npm run dev
```

Vite의 기본 주소는 `http://localhost:5173`입니다.

### 정적 검사와 빌드

```bash
npm run lint
npm run build
```

빌드 결과는 `dist/`에 생성됩니다.

## API 인증 처리

- 로그인 성공 후 JWT access token을 브라우저 저장소에 보관합니다.
- Axios interceptor가 이후 요청에 `Authorization: Bearer ...`를 추가합니다.
- `401` 응답을 받으면 토큰을 제거하고 로그인 화면으로 이동합니다.
- `403`과 서버 오류는 사용자에게 알림으로 표시합니다.

브라우저 저장소를 사용하는 현재 방식은 구현이 단순하지만 XSS에 노출될 경우 토큰이 탈취될 수 있습니다. 운영 보안을 강화하려면 CSP와 입력 처리 강화, 짧은 access token과 갱신 전략, HttpOnly cookie 방식 등을 함께 검토해야 합니다.

## 실시간 대시보드 갱신

프런트엔드는 `/ws`로 연결하고 `/topic/session/{sessionId}`를 구독합니다. 세션 변경 메시지를 받으면 대시보드 REST API를 다시 호출해 최신 상태를 가져옵니다.

```text
subscribe /topic/session/{sessionId}
  → receive session change event
  → GET /api/session/{sessionId}/dashboard
  → replace dashboard state
```

STOMP client의 재연결 간격은 5초입니다. 현재는 변경 범위와 무관하게 대시보드 전체를 다시 조회하므로 사용량이 커지면 이벤트별 부분 갱신을 검토할 수 있습니다.

## 디렉터리 구조

```text
src/
├── api/              # 인증, 회원, 세션, 대시보드, WebSocket 통신
├── components/       # 회원·세션 운영 UI
├── pages/            # 주요 화면
├── assets/           # 정적 이미지
├── utils/            # 저장소 등 공통 기능
├── App.tsx           # 화면 상태와 최상위 구성
└── main.tsx          # 애플리케이션 entry point
```

## 배포 관련 참고

이 디렉터리의 `.github/workflows`는 프런트엔드가 별도 저장소였을 때의 구조를 전제로 합니다. 현재 모노레포에서는 루트 workflow로 옮기거나 수정하지 않았으므로 자동 실행되지 않습니다.
