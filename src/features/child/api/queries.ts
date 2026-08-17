import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Child } from '../model/types';

import {
  createChild,
  fetchChildren,
  updateChild,
  type CreateChildInput,
  type UpdateChildInput,
} from './childApi';

export const childKeys = {
  all: ['child'] as const,
  list: () => [...childKeys.all, 'list'] as const,
};

/**
 * 보호자에게 등록된 아이 목록.
 *
 * 홈·마이페이지·리포트가 모두 같은 목록을 보므로 queryKey 하나를 공유한다.
 * 화면끼리 직접 넘기지 않고 각자 이 훅을 부르면 캐시가 알아서 한 번만 받아온다.
 */
export function useChildren() {
  return useQuery({
    queryKey: childKeys.list(),
    queryFn: fetchChildren,
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation<Child, unknown, CreateChildInput>({
    mutationFn: createChild,
    onSuccess: () => {
      // 목록을 직접 손대지 않고 무효화만 한다. 서버가 계산해 주는 값(age)이
      // 있어서 응답을 그대로 끼워 넣는 것보다 다시 받는 쪽이 안전하다.
      void queryClient.invalidateQueries({ queryKey: childKeys.list() });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation<Child, unknown, UpdateChildInput>({
    mutationFn: updateChild,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: childKeys.list() });
    },
  });
}
