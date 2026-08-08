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

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

/**
 * 응답 body 만 꺼내주는 얇은 래퍼.
 * 서버가 `{ data: ... }` 로 한 겹 감싸는 스펙이라면 여기서 벗겨내면 된다.
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
