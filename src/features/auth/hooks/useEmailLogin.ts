import { type Session } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';

import { setAuthToken, supabase } from '@/shared/api';

import { tryEnsureServerProfile } from '../api/ensureServerProfile';

export interface EmailLoginInput {
  email: string;
  password: string;
}

/**
 * 이메일/비밀번호 로그인.
 *
 * ```
 * ① 앱 → Supabase   signInWithPassword           → JWT 발급 (세션은 AsyncStorage 에)
 * ② 앱 → 우리 서버   POST /auth/sync-profile      → 서버 DB 의 보호자 행 보정
 * ```
 *
 * ## ②는 실패해도 로그인을 막지 않는다
 *
 * 서버에 `parents` 행이 없으면 뒤따르는 화면들이 전부 401 로 막힌다(백엔드 확인).
 * 앱의 가입 흐름을 타지 않은 계정 — 콘솔에서 직접 만든 것, 가입 도중 실패한 것 —
 * 도 여기서 붙어야 해서 로그인할 때마다 한 번 부른다. 이미 있으면 409 로 지나간다.
 *
 * **다만 실패를 로그인 실패로 다루지 않는다** (`tryEnsureServerProfile`).
 * 예전에는 실패 시 Supabase 세션까지 되돌려서, 백엔드 설정 문제 하나로 비밀번호가
 * 맞는데도 아무도 로그인할 수 없었다 (기기에서 재현: Supabase `token` 200 →
 * 우리 서버 401 → 앱이 `logout`).
 *
 * ## ①과 ② 사이에 토큰을 직접 싣는다
 *
 * `startAuthTokenSync()` 의 `onAuthStateChange` 도 같은 일을 하지만 **그 콜백이
 * ②보다 늦게 도는 일이 있다.** 그러면 ②가 Authorization 헤더 없이 나가고 서버는
 * `401 {"detail":"Not authenticated"}` 로 막는다.
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

      // ②가 헤더 없이 나가지 않도록 여기서 먼저 싣는다 (위 주석 참고).
      setAuthToken(data.session.access_token);

      // 서버 프로필 보정. 실패해도 로그인은 성립시킨다.
      // **기다리는 이유**: 여기서 안 기다리면 아이 목록 요청이 프로필보다 먼저 나간다.
      await tryEnsureServerProfile(data.user);

      return data.session;
    },
  });
}
