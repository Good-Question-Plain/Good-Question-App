import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/shared/api';

import {
  fetchParentProfile,
  updateParentProfile,
  verifyParentPassword,
  withdrawAccount,
  type ParentProfile,
  type UpdateParentInput,
} from './accountApi';

export const accountKeys = {
  all: ['account'] as const,
  me: () => [...accountKeys.all, 'me'] as const,
};

/** 로그인한 보호자 본인. 마이페이지 상단 카드가 쓴다. */
export function useParentProfile() {
  return useQuery({
    queryKey: accountKeys.me(),
    queryFn: fetchParentProfile,
  });
}

/**
 * 보호자 비밀번호 확인.
 *
 * 캐시할 것이 없어 mutation 이다. 성공 여부만 쓰인다.
 */
export function useVerifyParentPassword() {
  return useMutation<void, unknown, string>({
    mutationFn: verifyParentPassword,
  });
}

/**
 * 회원탈퇴.
 *
 * 서버가 계정을 지운 **뒤에** 로컬 세션을 지운다. 순서를 뒤집으면 토큰이
 * 사라져서 탈퇴 요청 자체가 401 로 막힌다.
 *
 * `signOut()` 이 `SIGNED_OUT` 을 발생시키므로 쿼리 캐시 비우기와 로그인 화면으로의
 * 이동은 각각 `startAuthTokenSync()` 와 `AuthGate` 가 알아서 한다.
 */
export function useWithdrawAccount() {
  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      await withdrawAccount();
      await supabase.auth.signOut();
    },
  });
}

export function useUpdateParentProfile() {
  const queryClient = useQueryClient();

  return useMutation<ParentProfile, unknown, UpdateParentInput>({
    mutationFn: updateParentProfile,
    onSuccess: (updated) => {
      // 응답이 갱신된 전체 프로필이라 그대로 캐시에 넣는다.
      // 서버가 계산해 주는 파생값이 없어서 다시 받아올 이유가 없다.
      queryClient.setQueryData(accountKeys.me(), updated);
    },
  });
}
