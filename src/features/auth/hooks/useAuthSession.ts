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
export function useAuthSession(): AuthSessionState {
  const [state, setState] = useState<AuthSessionState>({ session: null, isLoading: true });

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, isLoading: false });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ session, isLoading: false });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
