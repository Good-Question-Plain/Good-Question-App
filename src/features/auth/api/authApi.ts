import { request } from '@/shared/api';

/**
 * 인증 관련 백엔드 호출.
 *
 * **로그인은 여기에 없다.** 로그인은 Supabase 가 처리하고 우리 백엔드는 그 JWT 를
 * 검증만 한다 (명세의 권한 칸이 `SUPABASE_ONLY` / `PARENT` 로 나뉘는 이유).
 * 그래서 이메일/비밀번호를 우리 서버로 보내는 엔드포인트는 애초에 존재하지 않는다.
 *
 * **경로에 `/api` 를 붙이지 않는다.** 명세 상세 페이지의 EndPoint 는 `/api/...` 로
 * 적혀 있지만 배포된 서버는 그 경로를 모른다. 2026-08-15 에 직접 찔러 확인했다.
 *
 * ```
 * POST /auth/sync-profile      → 401 (엔드포인트가 있고 Bearer 를 요구한다)
 * POST /api/auth/sync-profile  → 404
 * GET  /users/me · /vocabulary · /sessions/{id}/post-activity → 401
 * GET  /api/... 는 전부 404
 * ```
 *
 * 즉 데이터베이스의 `api path` 속성(`/auth/sync-profile`)이 맞고 상세 페이지가
 * 틀렸다. 명세 쪽 표기를 백엔드에 고쳐달라고 해야 한다.
 */

/** `POST /auth/sync-profile` 의 성공 응답 (201). */
export interface SyncProfileResponse {
  message: string;
}

/**
 * Supabase 계정에 대응하는 프로필을 우리 서버 DB 에 만든다.
 *
 * 회원가입이 아니다 — 계정은 이미 Supabase 에 있고, 이건 그 계정을 서버가 알게
 * 하는 단계다. 이걸 건너뛰면 `PARENT` 권한이 필요한 나머지 API 가 전부
 * 401 "프로필이 등록되지 않은 사용자입니다" 로 막힌다.
 *
 * 이미 등록돼 있으면 409 가 온다 (= `ApiError.kind === 'conflict'`).
 */
export function syncProfile(name: string): Promise<SyncProfileResponse> {
  return request<SyncProfileResponse>({
    method: 'POST',
    url: '/auth/sync-profile',
    data: { name },
  });
}
