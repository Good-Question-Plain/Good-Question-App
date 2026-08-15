import { type Session } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/shared/api';

import { ensureServerProfile } from '../api/ensureServerProfile';

export interface EmailLoginInput {
  email: string;
  password: string;
}

/**
 * 이메일/비밀번호 로그인.
 *
 * 두 서버를 순서대로 거친다. 순서가 뒤바뀌면 안 된다.
 *
 * ```
 * ① Supabase   signInWithPassword           → JWT 발급 (세션은 AsyncStorage 에 저장된다)
 * ② 우리 서버  POST /api/auth/sync-profile  → 서버 DB 에 보호자 프로필 생성
 * ```
 *
 * ②는 회원가입에서 이미 끝났을 것이라 보통 409 로 지나간다. 그래도 매번 부르는
 * 이유는 콘솔에서 직접 만든 계정처럼 앱의 가입 흐름을 타지 않은 계정이 있기
 * 때문이다 — 그런 계정도 여기서 프로필이 붙는다.
 *
 * 토큰은 따로 다루지 않는다 — `startAuthTokenSync()` 가 `onAuthStateChange` 를
 * 구독하고 있어서 ①이 성공하는 순간 `apiClient` 에 자동으로 실린다.
 */
export function useEmailLogin() {
  return useMutation<Session, unknown, EmailLoginInput>({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        // 이메일은 대소문자를 가리지 않지만 앞뒤 공백은 그대로 전송돼 실패한다.
        // 태블릿 소프트 키보드가 단어 뒤에 공백을 붙이는 일이 잦다.
        email: email.trim(),
        password,
      });

      if (error) throw error;

      await ensureServerProfile(data.user);
      return data.session;
    },
  });
}
