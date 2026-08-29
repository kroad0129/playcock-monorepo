# PLAYCOCK API

백엔드가 제공하는 REST API와 실시간 알림 채널을 정리한 문서입니다. 기본 경로는 `/api`이며, 성공 응답은 공통 응답 객체로 감쌉니다.

## 인증과 권한

로그인 응답의 `accessToken`을 이후 요청에 전달합니다.

```http
Authorization: Bearer <access-token>
```

| 구분 | 접근 범위 |
| --- | --- |
| Public | 로그인, 회원가입, Swagger·정적 리소스, WebSocket handshake, health check |
| Authenticated | 내 정보 조회, 사용자 삭제 등 별도 역할 제한이 없는 요청 |
| MANAGER / ADMIN | 회원 관리, 세션과 경기 운영, 사용자 상태 변경 |
| ADMIN | 사용자 역할 변경 |

> 현재 `DELETE /api/users/{userId}`에는 별도의 관리자 권한 규칙이 없어 인증된 사용자에게 열려 있습니다. 운영 적용 전 본인 계정만 삭제할지, 관리자만 삭제할지 정책을 명확히 하고 인가를 보강해야 합니다.

## 공통 응답

성공 응답의 기본 구조입니다.

```json
{
  "status": 200,
  "message": "요청에 성공했습니다.",
  "data": {}
}
```

오류 응답의 기본 구조입니다.

```json
{
  "timestamp": "2026-03-01T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "오류 설명",
  "path": "/api/session/1"
}
```

주요 오류 상태는 다음과 같습니다.

| 상태 | 사례 |
| --- | --- |
| 400 | 요청 검증 실패, 허용되지 않은 상태 전이 |
| 401 | 로그인 실패, 유효하지 않은 인증 |
| 403 | 비활성 사용자, 권한 부족 |
| 404 | 회원 등 리소스를 찾을 수 없음 |
| 409 | 이메일 중복 |
| 500 | 처리되지 않은 서버 오류 |

## 인증 API

### 로그인

`POST /api/auth/login`

```json
{
  "email": "manager@example.com",
  "password": "password"
}
```

응답 데이터:

```json
{
  "accessToken": "eyJ..."
}
```

JWT에는 사용자 ID, 이메일, 역할이 포함되며 현재 설정 기준 유효 시간은 24시간입니다.

## 사용자 API

| Method | Path | 권한 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/users` | Public | 사용자 가입 |
| GET | `/api/users/me` | Authenticated | 현재 사용자 조회 |
| PATCH | `/api/users/{userId}/role` | ADMIN | 역할 변경 |
| PATCH | `/api/users/{userId}/status` | MANAGER, ADMIN | 계정 상태 변경 |
| DELETE | `/api/users/{userId}` | Authenticated | 사용자 삭제 |

가입 요청:

```json
{
  "email": "manager@example.com",
  "password": "password",
  "name": "운영자"
}
```

가입 시 역할은 `USER`, 상태는 `ACTIVE`로 생성됩니다. 비밀번호 길이는 4~20자, 이름은 최대 30자입니다.

역할 변경 요청:

```json
{ "role": "MANAGER" }
```

상태 변경 요청:

```json
{ "status": "ACTIVE" }
```

## 회원 API

모든 회원 관리 API는 `MANAGER` 또는 `ADMIN` 권한이 필요합니다.

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/members` | 회원 생성 |
| GET | `/api/members/{memberId}` | 회원 단건 조회 |
| GET | `/api/members` | 회원 검색 및 페이지 조회 |
| PUT | `/api/members/{memberId}` | 회원 정보 수정 |
| DELETE | `/api/members/{memberId}` | 회원 삭제 |

생성·수정 요청 예시:

```json
{
  "name": "김회원",
  "schoolName": "건국대학교",
  "generation": 12,
  "email": "member@example.com",
  "gender": "MALE",
  "phoneNumber": "010-0000-0000",
  "memberType": "MEMBER",
  "active": true,
  "grade": "B",
  "note": "운영 메모"
}
```

검색 쿼리:

| Query | 설명 |
| --- | --- |
| `name` | 이름 |
| `schoolName` | 학교명 |
| `generation` | 기수 |
| `gender` | 성별 |
| `memberType` | 회원 구분 |
| `grade` | 급수 |
| `active` | 활동 여부 |
| `page` | 페이지 번호, 기본 0 |
| `size` | 페이지 크기, 기본 10 |
| `sort` | 정렬 조건, 기본 `id,desc` |

## 세션·경기 API

모든 세션 API는 `MANAGER` 또는 `ADMIN` 권한이 필요합니다.

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/session` | 세션 생성 |
| GET | `/api/session` | 세션 목록 조회 |
| GET | `/api/session/{id}/dashboard` | 운영 대시보드 조회 |
| PATCH | `/api/session/{id}/end` | 세션 종료 |
| POST | `/api/session/{id}/participant` | 참가자 추가 또는 복귀 |
| DELETE | `/api/session/{id}/participant/{participantId}` | 참가자 제외 |
| POST | `/api/session/{id}/waiting-team` | 4인 대기 팀 생성 |
| DELETE | `/api/session/{id}/waiting-team/{waitingTeamId}` | 대기 팀 취소 |
| POST | `/api/session/{id}/match/start` | 대기 팀의 경기 시작 |
| POST | `/api/session/{id}/match/{matchId}/end` | 경기 종료 |

### 세션 생성

```json
{
  "category": "REGULAR",
  "location": "체육관",
  "note": "정기 운동"
}
```

`category`를 생략하면 `REGULAR`을 사용합니다. 세션은 생성 즉시 `IN_PROGRESS` 상태가 되며 날짜와 카테고리를 바탕으로 제목을 생성합니다.

### 참가자 추가

```json
{
  "memberIds": [1, 2, 3, 4]
}
```

처음 참가하는 회원은 `LISTED`로 생성됩니다. 같은 세션에서 `REMOVED`였던 회원은 기존 참가 기록을 복원하며, 이미 다른 활성 상태라면 중복 추가를 거부합니다.

### 대기 팀 생성

```json
{
  "sessionParticipantIds": [11, 12, 13, 14]
}
```

- 참가자는 중복되지 않은 정확히 4명이어야 합니다.
- 모두 같은 세션에 속하고 `LISTED` 상태여야 합니다.
- 생성 후 네 참가자는 `WAITING` 상태가 됩니다.

### 경기 시작

```json
{
  "waitingTeamId": 7
}
```

대기 팀이 같은 세션에 속하고 네 명 모두 `WAITING`일 때 경기를 시작합니다. 성별 구성으로 경기 유형을 판정하고 참가자 상태를 `PLAYING`으로 변경한 뒤 사용한 대기 팀을 제거합니다.

### 경기 종료

경기를 종료하면 다음 작업을 함께 수행합니다.

- 경기 상태를 `ENDED`로 변경
- 참가자의 전체 경기 수 증가
- 남자·여자·혼합 복식 중 해당 종목 횟수 증가
- 참가자 상태를 `LISTED`로 복귀
- 마지막 경기 시각과 다시 대기 명단에 들어온 시각 갱신

### 세션 종료

대기 팀이나 `IN_PROGRESS` 경기가 남아 있으면 세션을 종료할 수 없습니다. 종료된 세션에서는 참가자·대기 팀·경기 상태를 더 이상 변경할 수 없습니다.

## 주요 열거형

| 구분 | 값 |
| --- | --- |
| 사용자 역할 | `USER`, `MANAGER`, `ADMIN` |
| 사용자 상태 | `PENDING`, `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| 세션 종류 | `REGULAR`, `FLASH` |
| 세션 상태 | `IN_PROGRESS`, `ENDED` |
| 참가자 상태 | `LISTED`, `WAITING`, `PLAYING`, `REMOVED` |
| 경기 상태 | `IN_PROGRESS`, `ENDED` |
| 경기 유형 | `MALE_DOUBLE`, `FEMALE_DOUBLE`, `MIXED_DOUBLE` |
| 회원 구분 | `MEMBER`, `GUEST`, `ETC` |
| 급수 | `NONE`, `A`, `B`, `C`, `D`, `E`, `F` |
| 성별 | `MALE`, `FEMALE`, `OTHER`, `UNKNOWN` |

## WebSocket과 STOMP

| 항목 | 값 |
| --- | --- |
| 연결 endpoint | `/ws` |
| 구독 destination | `/topic/session/{sessionId}` |
| Application prefix | `/app` |
| 재연결 간격 | 프런트엔드 기준 5초 |

회원·대기 팀·경기·세션 상태가 변경되면 서버가 Redis의 `session:{sessionId}` 채널에 세션 ID를 발행합니다. 구독자가 이를 받아 `/topic/session/{sessionId}`로 전달하며, 프런트엔드는 메시지 수신 후 `GET /api/session/{id}/dashboard`를 다시 호출합니다.

현재 WebSocket handshake와 STOMP 구독에는 JWT 기반 인가 처리가 구현되어 있지 않으므로 운영 보안 보완 항목입니다.

