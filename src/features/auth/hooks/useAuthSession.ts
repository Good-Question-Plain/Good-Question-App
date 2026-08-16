import { type Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/shared/api';

export interface AuthSessionState {
  session: Session | null;
  /** 저장된 세션을 아직 읽는 중. 이때 화면을 그리면 로그인 화면이 한 번 번쩍인다. */
  isLoading: boolean;
}

/**
 * 지금 로그인돼 있는지를 구독한다.
 *
 * `startAuthTokenSync()` 와 역할이 다르다 — 그쪽은 토큰을 `apiClient` 에 싣는
 * 부수효과만 하고 아무것도 렌더링하지 않는다. 이건 화면이 세션 상태에 따라
 * 다시 그려져야 할 때 쓴다.
 *
 * 앱을 껐다 켜면 세션은 AsyncStorage 에 남아 있지만 읽어오는 데 한 틱이 걸린다.
 * 그 사이를 `isLoading` 으로 구분하지 않으면 **로그인된 사용자에게도 로그인
 * 화면이 한 번 번쩍인다.**
 */
/**
 * 세션 확인을 언제까지 기다릴지.
 *
 * **이 안전장치가 없으면 앱 전체가 빈 화면으로 멈춘다.** `getSession()` 은
 * 저장된 토큰이 만료됐으면 네트워크로 갱신을 시도하는데, 서버가 느리거나
 * 응답이 없으면 영원히 안 끝난다. 그동안 `AuthGate` 는 아무것도 그리지 않는다.
 * 실제로 기기에서 흰 화면으로 굳는 걸 확인했다.
 *
 * `Appear` 가 애니메이션에 타이머 안전장치를 두는 것과 같은 이유다 (AGENTS.md) —
 * 비동기가 안 끝나도 화면은 최종 상태에 도달해야 한다.
 */
const SESSION_TIMEOUT_MS = 3000;

export function useAuthSession(): AuthSessionState {
  const [state, setState] = useState<AuthSessionState>({ session: null, isLoading: true });

  useEffect(() => {
    let active = true;

    // 시간 안에 답이 없으면 "로그인 안 됨"으로 보고 진행한다. 뒤늦게 세션이
    // 도착하면 아래 onAuthStateChange 가 받아서 화면을 고쳐준다.
    const timer = setTimeout(() => {
      if (active) setState((prev) => (prev.isLoading ? { ...prev, isLoading: false } : prev));
    }, SESSION_TIMEOUT_MS);

    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, isLoading: false });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ session, isLoading: false });
    });

    return () => {
      active = false;
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
