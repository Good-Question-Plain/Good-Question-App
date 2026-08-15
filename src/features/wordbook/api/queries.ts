import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, toApiError } from '@/shared/api';

import type { WordEntry } from '../model/types';

import { fetchWordDetail, fetchWords, setWordSaved } from './wordbookApi';

export const wordbookKeys = {
  all: ['wordbook'] as const,
  list: (childId: string, storyId?: string) =>
    [...wordbookKeys.all, 'list', childId, storyId ?? null] as const,
  detail: (childId: string, vocabId: string) =>
    [...wordbookKeys.all, 'detail', childId, vocabId] as const,
};

/**
 * 단어 목록.
 *
 * `childId` 가 빈 문자열이면(아직 아이 목록을 못 받은 상태) 요청하지 않는다.
 * 그대로 보내면 서버가 400 을 주고 화면에는 원인 없는 에러만 남는다.
 */
export function useWords(childId: string, storyId?: string) {
  return useQuery({
    queryKey: wordbookKeys.list(childId, storyId),
    queryFn: () => fetchWords({ childId, storyId }),
    enabled: childId.length > 0,
  });
}

export function useWordDetail(childId: string, vocabId: string) {
  return useQuery({
    queryKey: wordbookKeys.detail(childId, vocabId),
    queryFn: () => fetchWordDetail(vocabId, childId),
    enabled: childId.length > 0 && vocabId.length > 0,
  });
}

interface ToggleSaveInput {
  vocabId: string;
  saved: boolean;
}

/**
 * 하트를 눌러 저장/해제한다.
 *
 * **낙관적 갱신을 쓴다.** 아이가 하트를 눌렀는데 왕복이 끝날 때까지 아무 반응이
 * 없으면 고장난 걸로 보고 계속 누른다. 먼저 채워 보여주고, 실패하면 되돌린다.
 */
export function useToggleWordSaved(childId: string, storyId?: string) {
  const queryClient = useQueryClient();
  const listKey = wordbookKeys.list(childId, storyId);

  return useMutation<void, unknown, ToggleSaveInput, { previous: WordEntry[] | undefined }>({
    mutationFn: async ({ vocabId, saved }) => {
      try {
        await setWordSaved(vocabId, childId, saved);
      } catch (error) {
        const apiError = toApiError(error);
        // 409 "이미 저장된 단어입니다" — 원하던 상태가 이미 서버에 있는 것이라
        // 실패로 다루지 않는다. 하트를 빠르게 두 번 누르면 실제로 발생한다.
        if (apiError.kind === 'conflict' && saved) return;
        throw apiError;
      }
    },

    onMutate: async ({ vocabId, saved }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<WordEntry[]>(listKey);

      queryClient.setQueryData<WordEntry[]>(listKey, (words) =>
        words?.map((word) => (word.id === vocabId ? { ...word, saved } : word)),
      );

      return { previous };
    },

    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },

    onSettled: (_data, _error, { vocabId }) => {
      // 목록과 상세가 같은 `is_saved` 를 들고 있어서 둘 다 다시 맞춘다.
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: wordbookKeys.detail(childId, vocabId) });
    },
  });
}

/** 화면에서 에러 문구를 고를 때 쓴다. 저장 실패는 원인별로 할 말이 다르다. */
export function wordbookErrorMessage(error: unknown): string {
  const apiError = error instanceof ApiError ? error : toApiError(error);
  if (apiError.kind === 'forbidden') return '이 아이의 단어장을 볼 수 없어요.';
  if (apiError.kind === 'notFound') return '단어를 찾을 수 없어요.';
  return apiError.message;
}
