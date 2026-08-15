import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/shared/api';

import { ensureServerProfile } from '../api/ensureServerProfile';

/**
 * 회원가입 3단계를 Supabase 에 매핑한 훅 묶음.
 *
 * 시안의 단계(이메일 → 인증코드 6자리 → 비밀번호)를 그대로 살리려고
 * `signUp()` 이 아니라 **OTP 흐름**을 쓴다.
 *
 * ```
 * 1단계  signInWithOtp({ shouldCreateUser: true })  → 메일로 6자리 코드 발송, 계정 생성
 * 2단계  verifyOtp({ type: 'email' })               → 코드 확인. 여기서 세션이 생긴다
 * 3단계  updateUser({ password }) + sync-profile    → 비밀번호 설정, 서버 프로필 생성
 * ```
 *
 * `signUp({ email, password })` 를 쓰지 않은 이유가 두 가지다.
 * - 시안은 비밀번호를 **코드 확인 뒤에** 받는데 `signUp` 은 그보다 먼저 필요하다.
 * - Confirm email 이 켜져 있으면 `signUp` 직후에는 세션이 없어서
 *   (`{ user, session: null }`) `sync-profile` 을 부를 수 없다. OTP 는 2단계에서
 *   바로 세션이 생기므로 가입 자리에서 프로필까지 끝난다.
 *
 * **콘솔 설정 의존**: Supabase 의 Magic Link 이메일 템플릿이 기본값(`{{ .ConfirmationURL }}`)
 * 이면 메일에 링크만 오고 6자리 코드가 보이지 않는다. 템플릿에 `{{ .Token }}` 을
 * 넣어야 이 화면이 동작한다.
 */

/**
 * 1단계 — 메일로 인증코드를 보낸다.
 *
 * `shouldCreateUser` 로 가입과 비밀번호 찾기가 갈린다.
 * - 가입(true): 계정이 없으면 이때 만들어진다
 * - 비밀번호 찾기(false): **없는 이메일이면 실패해야 한다.** true 로 두면
 *   오타 친 주소로 새 계정이 조용히 생기고, 아이는 "재설정했는데 로그인이
 *   안 된다"는 상태에 빠진다
 */
export function useSendEmailCode(shouldCreateUser: boolean) {
  return useMutation<void, unknown, string>({
    mutationFn: async (email) => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser },
      });
      if (error) throw error;
    },
  });
}

/** 가입용 별칭. 호출부에서 true/false 를 헷갈리지 않도록 이름을 남겨둔다. */
export function useSendSignUpCode() {
  return useSendEmailCode(true);
}

export interface VerifyCodeInput {
  email: string;
  token: string;
}

/**
 * 2단계 — 코드를 확인한다. 성공하면 세션이 생겨 이후 요청에 Bearer 가 실린다.
 * 가입과 비밀번호 찾기가 같은 동작이라 그대로 함께 쓴다.
 */
export function useVerifySignUpCode() {
  return useMutation<void, unknown, VerifyCodeInput>({
    mutationFn: async ({ email, token }) => {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        // 'signup' 이 아니라 'email' 이다. `signInWithOtp` 로 보낸 코드는 신규·기존
        // 계정을 가리지 않고 이 타입으로 확인한다.
        type: 'email',
      });
      if (error) throw error;
    },
  });
}

/**
 * 3단계 — 비밀번호를 설정하고 서버에 프로필을 만든다.
 *
 * 2단계에서 생긴 세션에 비밀번호를 붙이는 것이라 별도의 인자가 없다.
 * 여기까지 와야 다음 로그인부터 이메일/비밀번호로 들어올 수 있다.
 */
export function useCompleteSignUp() {
  return useMutation<void, unknown, string>({
    mutationFn: async (password) => {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await ensureServerProfile(data.user);
    },
  });
}

/**
 * 비밀번호 재설정의 마지막 단계.
 *
 * `useCompleteSignUp` 과 하는 일이 거의 같지만 **`sync-profile` 을 부르지
 * 않는다** — 기존 계정이라 서버 프로필이 이미 있고, 부르면 매번 409 가 난다.
 * 새 비밀번호가 이전과 같으면 Supabase 가 `same_password` 로 거절한다.
 */
export function useResetPassword() {
  return useMutation<void, unknown, string>({
    mutationFn: async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
  });
}
