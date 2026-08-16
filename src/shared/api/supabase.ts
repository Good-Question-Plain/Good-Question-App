import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, isAuthRetryableFetchError } from '@supabase/supabase-js';
import { AppState, type AppStateStatus } from 'react-native';

import { env } from '@/shared/config/env';

import { setAuthToken, setAuthTokenRefresher, setStoredTokenLoader } from './client';
import { queryClient } from './queryClient';

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
 * **토큰 자동 갱신을 `AppState` 에 물리는 것도 여기서 한다.** 아래 주석 참고.
 *
 * 반환값은 구독 해제 함수다.
 */
export function startAuthTokenSync(): () => void {
  /**
   * 토큰 자동 갱신을 앱 상태에 맞춰 켜고 끈다.
   *
   * **`autoRefreshToken: true` 만으로는 React Native 에서 부족하다.** 갱신은
   * 타이머로 도는데 앱이 백그라운드로 가면 타이머가 멎고, 돌아와도 다시 시작되지
   * 않는다. 그러면 액세스 토큰(수명 1시간)이 만료된 채로 남아 모든 요청이
   * 401 로 떨어진다.
   *
   * 태블릿 앱이라 특히 문제가 된다 — 아이가 잠깐 놓아두고 돌아오는 게 기본
   * 사용 패턴이고, 그때마다 이야기 도중에 끊기면 안 된다.
   */
  const syncAutoRefresh = (status: AppStateStatus): void => {
    if (status === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  };

  syncAutoRefresh(AppState.currentState);
  const appStateSub = AppState.addEventListener('change', syncAutoRefresh);

  // 아래 `getSession()` 보다 화면이 먼저 떠서 요청이 나가는 경우를 대비해,
  // 토큰이 비어 있으면 저장된 세션에서 꺼내 쓰도록 통로를 열어둔다.
  setStoredTokenLoader(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  });

  /**
   * 백엔드가 401 을 주면 토큰을 한 번 되살린다 (`apiClient` 가 부른다).
   *
   * `AppState` 로 자동 갱신을 살려놔도 만료를 앞지르지 못하는 순간이 있다 —
   * 기기가 잠들어 있던 사이 만료됐거나, 시계가 어긋났거나, 갱신 요청 자체가
   * 한 번 실패한 경우다. 그때 여기가 마지막 방어선이 된다.
   */
  setAuthTokenRefresher(async () => {
    const { data, error } = await supabase.auth.refreshSession();
    const token = data.session?.access_token ?? null;
    if (token !== null) return token;

    // **네트워크가 잠깐 끊긴 것으로는 로그아웃시키지 않는다.** 지하철에서 잠깐
    // 끊겼다고 이야기 도중에 로그인 화면으로 튕기면 아이는 영문을 모른다.
    // 이 경우 요청은 401 로 실패하지만 세션은 그대로라 다음 요청에서 회복된다.
    if (error !== null && isAuthRetryableFetchError(error)) return null;

    // 되살릴 수 없는 세션이다. 정리하면 `AuthGate` 가 로그인 화면으로 되돌린다.
    // `scope: 'local'` — 인자를 안 주면 그 계정의 **모든 기기** 세션이 끊긴다.
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  });

  // 앱을 껐다 켜면 세션은 AsyncStorage 에 남아 있지만 메모리의 토큰은 비어 있다.
  // onAuthStateChange 가 INITIAL_SESSION 을 주긴 하나, 첫 요청이 그보다 빠를 수
  // 있어 여기서 한 번 직접 채운다.
  void supabase.auth.getSession().then(({ data }) => {
    setAuthToken(data.session?.access_token ?? null);
  });

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    setAuthToken(session?.access_token ?? null);

    // 로그아웃하면 받아둔 서버 데이터를 전부 버린다. 안 지우면 다른 계정으로
    // 다시 로그인했을 때 **이전 사용자의 아이 목록·단어장이 잠깐 그대로 보인다**
    // (TanStack Query 는 캐시를 먼저 보여주고 뒤에서 다시 받아온다).
    if (event === 'SIGNED_OUT') {
      queryClient.clear();
    }
  });

  return () => {
    appStateSub.remove();
    void supabase.auth.stopAutoRefresh();
    data.subscription.unsubscribe();
  };
}
