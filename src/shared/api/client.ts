import { create as createAxiosInstance, type AxiosRequestConfig } from 'axios';

import { env } from '@/shared/config/env';

import { toApiError } from './errors';

/**
 * 앱 전체가 공유하는 HTTP 클라이언트.
 *
 * feature 코드에서 axios 를 직접 import 하지 말고 항상 이 인스턴스를 쓴다.
 * 그래야 baseURL / 토큰 / 에러 정규화가 한 곳에 모인다.
 */
export const apiClient = createAxiosInstance({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * 인증 토큰 보관소.
 *
 * 지금은 메모리에만 둔다. 로그인 유지가 필요해지면 AsyncStorage 로 옮기고
 * 앱 시작 시 `setAuthToken` 을 한 번 호출하도록 바꾸면 된다 — 호출부는 그대로다.
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * 메모리에 토큰이 없을 때 저장된 세션에서 꺼내오는 함수.
 *
 * `supabase.ts` 가 등록한다. 여기서 supabase 를 직접 import 하면 순환 참조가
 * 된다 (`supabase.ts` → `client.ts` 의 `setAuthToken`).
 */
let loadStoredToken: (() => Promise<string | null>) | null = null;

export function setStoredTokenLoader(loader: () => Promise<string | null>): void {
  loadStoredToken = loader;
}

/** 같은 순간에 여러 요청이 몰려도 세션은 한 번만 읽는다. */
let pendingLoad: Promise<string | null> | null = null;

/** 세션 읽기가 안 끝나도 요청은 나가야 한다 (`useAuthSession` 과 같은 이유). */
const TOKEN_WAIT_MS = 3000;

/**
 * 앱을 켜자마자 나가는 첫 요청이 토큰 없이 나가는 것을 막는다.
 *
 * `startAuthTokenSync()` 가 세션을 읽어 `setAuthToken` 을 부르는데, 화면이 그보다
 * 먼저 떠서 쿼리를 날리면 **Authorization 헤더 없이** 나간다. 서버는
 * `401 {"detail":"Not authenticated"}` 로 막고, 401 은 재시도 대상이 아니라
 * 그대로 실패로 굳는다 (실기기 로그에서 확인했다).
 */
async function resolveToken(): Promise<string | null> {
  if (authToken !== null) return authToken;
  if (loadStoredToken === null) return null;

  pendingLoad ??= loadStoredToken().finally(() => {
    pendingLoad = null;
  });

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), TOKEN_WAIT_MS));
  return Promise.race([pendingLoad, timeout]);
}

apiClient.interceptors.request.use(async (config) => {
  const token = await resolveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    // [임시] 실기기 연동 점검용. 실패한 요청이 로그에 안 남아 원인을 못 봤다.
    // 서버가 준 본문까지 그대로 찍는다 — 401 이 "토큰이 틀렸다"인지
    // "프로필이 없다"인지는 본문으로만 갈린다.
    const at = (error as { config?: { method?: string; url?: string } }).config;
    const body = (error as { response?: { data?: unknown } }).response?.data;
    console.log(
      `[API] ${at?.method?.toUpperCase() ?? '?'} ${at?.url ?? '?'} → ${apiError.status ?? '-'} ${apiError.kind} :: ${JSON.stringify(body)}`,
    );
    return Promise.reject(apiError);
  },
);

/**
 * 응답 body 만 꺼내주는 얇은 래퍼.
 * 서버가 `{ data: ... }` 로 한 겹 감싸는 스펙이라면 여기서 벗겨내면 된다.
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
