# PLAYCOCK Backend

PLAYCOCK의 회원, 운동 세션, 대기 팀, 경기 상태와 실시간 변경 알림을 담당하는 Spring Boot 애플리케이션입니다.

- 프로젝트 전체 설명: [../README.md](../README.md)
- API 명세: [../docs/API.md](../docs/API.md)
- 아키텍처: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- 데이터 모델: [../docs/DATABASE.md](../docs/DATABASE.md)

## 기술 구성

- Java 17
- Spring Boot 3.5.11
- Spring Web, Validation
- Spring Security, JWT
- Spring Data JPA, PostgreSQL
- Spring Data Redis, Redis Pub/Sub
- WebSocket, STOMP
- springdoc-openapi
- Gradle

## 모듈

| 경로 | 책임 |
| --- | --- |
| `auth` | 이메일·비밀번호 로그인과 JWT 발급 |
| `user` | 운영 사용자 가입, 역할과 상태 관리 |
| `member` | 회원 생성·검색·수정·삭제 |
| `session` | 세션, 참가자, 대기 팀, 경기와 대시보드 |
| `global/config` | Security, Redis, WebSocket, Swagger 설정 |
| `global/jwt` | JWT 생성, 검증과 인증 필터 |
| `global/exception` | 예외와 공통 오류 응답 |
| `global/response` | 공통 성공 응답 |

## 실행 방법

### 요구 사항

- JDK 17
- Docker와 Docker Compose
- 사용 가능한 포트: `8080`, `5432`, `6379`

### Docker Compose 실행

`docker-compose-prod.yml`은 PostgreSQL, Redis, 애플리케이션을 함께 실행하며 애플리케이션에는 `docker` 프로필을 적용합니다.

1. `backend` 디렉터리에 `.env`를 만듭니다.

```dotenv
DB_PASSWORD=change-me
JWT_SECRET=replace-with-a-long-random-secret
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

2. Dockerfile이 사용할 jar를 만든 뒤 Compose를 실행합니다.

```bash
./gradlew clean bootJar
docker compose -f docker-compose-prod.yml up --build
```

Windows Git Bash에서 wrapper 실행이 어렵다면 다음 명령을 사용할 수 있습니다.

```bash
./gradlew.bat clean bootJar
```

3. 상태를 확인합니다.

- API: `http://localhost:8080`
- Health: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

종료:

```bash
docker compose -f docker-compose-prod.yml down
```

데이터 볼륨까지 제거하면 PostgreSQL 데이터도 삭제되므로, `down -v`는 초기화가 필요할 때만 사용하세요.

### IDE 또는 Gradle 직접 실행

기본 `application.yml`은 `local` 프로필을 활성화하지만, 현재 저장소에는 `application-local.yml`이 없습니다. 직접 실행하려면 로컬 프로필 설정 파일을 별도로 만들거나 필요한 데이터소스·Redis·JWT 설정을 외부 설정으로 제공해야 합니다.

민감한 값을 포함한 실제 설정 파일은 커밋하지 말고 `.gitignore` 대상 또는 환경 변수로 관리하세요.

## 프로필 차이

| 항목 | `docker` | `prod` |
| --- | --- | --- |
| Schema | Hibernate `update` | Hibernate `validate` |
| Flyway | 비활성 | 활성, baseline 사용 |
| Swagger | 사용 가능 | 비활성 |
| Health 상세 | 항상 표시 | 표시하지 않음 |

현재 공개 저장소에는 Flyway migration SQL이 없으므로 `prod` 프로필로 빈 데이터베이스를 재현하려면 migration을 먼저 추가해야 합니다.

## 인증과 권한

Spring Security는 서버 세션을 만들지 않는 stateless 방식입니다. 로그인으로 받은 JWT를 다음과 같이 전달합니다.

```http
Authorization: Bearer <access-token>
```

- 회원 및 세션 운영: `MANAGER`, `ADMIN`
- 사용자 상태 변경: `MANAGER`, `ADMIN`
- 사용자 역할 변경: `ADMIN`
- 로그인·가입: 공개

세부 endpoint와 현재 인가 보완점은 [API 문서](../docs/API.md)를 확인하세요.

## 실시간 이벤트

세션 상태가 변경되면 `session:{sessionId}` Redis 채널에 세션 ID를 발행합니다. Redis subscriber는 이를 `/topic/session/{sessionId}` STOMP destination으로 전달합니다.

```text
Domain Service
  → Redis session:{sessionId}
  → Redis Subscriber
  → STOMP /topic/session/{sessionId}
  → Client dashboard refetch
```

WebSocket 연결 endpoint는 `/ws`입니다.

## 테스트

```bash
./gradlew test
```

현재 테스트는 애플리케이션 컨텍스트 로딩 수준으로 제한적입니다. 다음 테스트를 우선 추가할 수 있습니다.

- 참가자 상태 전이 서비스 단위 테스트
- 정확히 네 명만 대기 팀으로 묶이는지 검증
- 대기 팀 취소와 경기 종료 시 시간·횟수 갱신 검증
- 세션 종료 조건 통합 테스트
- 두 운영자의 동시 팀 생성 요청에 대한 동시성 테스트
- 역할별 API 인가 테스트

## 배포 관련 참고

이 디렉터리의 `.github/workflows`는 백엔드가 별도 저장소였을 때의 경로와 배포 환경을 전제로 합니다. 현재 모노레포에서는 GitHub Actions가 자동으로 인식하는 루트 `.github/workflows`에 있지 않으며, 통합 배포용으로 재구성하지 않은 상태입니다.

