import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { env } from '@/shared/config/env';

import { setAuthToken } from './client';

/**
 * Supabase 클라이언트.
 *
 * 로그인은 우리 서버가 아니라 Supabase 가 처리하고, 백엔드는 그 JWT 를 검증만 한다
 * (API 명세의 권한 칸이 `SUPABASE_ONLY` / `PARENT` 로 나뉘는 이유다).
 * 그래서 아이디/비밀번호를 우리 서버로 보내는 로그인 엔드포인트는 존재하지 않는다.
 *
 * React Native 설정 두 가지가 중요하다.
 * - `storage: AsyncStorage` — 없으면 앱을 끌 때마다 로그인이 풀린다.
 * - `detectSessionInUrl: false` — 브라우저 URL 에서 세션을 찾는 웹 전용 동작이라
 *   RN 에서는 켜두면 안 된다. 소셜 로그인 복귀는 딥링크로 직접 처리한다.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * Supabase 세션의 토큰을 `apiClient` 에 흘려보낸다.
 *
 * 앱 시작 시 한 번 부르면 그 뒤로는 로그인·로그아웃·토큰 갱신이 일어날 때마다
 * 자동으로 따라간다. 호출부는 `setAuthToken` 을 직접 부를 일이 없다.
 *
 * 반환값은 구독 해제 함수다.
 */
export function startAuthTokenSync(): () => void {
  // 앱을 껐다 켜면 세션은 AsyncStorage 에 남아 있지만 메모리의 토큰은 비어 있다.
  // onAuthStateChange 가 INITIAL_SESSION 을 주긴 하나, 첫 요청이 그보다 빠를 수
  // 있어 여기서 한 번 직접 채운다.
  void supabase.auth.getSession().then(({ data }) => {
    setAuthToken(data.session?.access_token ?? null);
  });

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    setAuthToken(session?.access_token ?? null);
  });

  return () => data.subscription.unsubscribe();
}
