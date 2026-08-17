import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toApiError } from '@/shared/api';

import {
  fetchStoryReport,
  generateStoryReport,
  type GenerateReportResult,
  type StoryReport,
} from './reportApi';

export const reportKeys = {
  all: ['report'] as const,
  detail: (childId: string, storyId: string) =>
    [...reportKeys.all, 'detail', childId, storyId] as const,
};

/** 생성이 끝날 때까지 다시 물어보는 간격. 서버가 몇 초 안에 끝낸다고 해서 짧게 잡았다. */
const POLL_INTERVAL_MS = 3000;

/**
 * 이야기 하나의 보호자 리포트.
 *
 * **`generating` 이면 스스로 다시 물어본다.** 생성이 백그라운드로 돌아가서
 * 한 번 받아온 값이 빈 껍데기일 수 있기 때문이다. `completed`/`failed` 가 되면
 * 폴링을 멈춘다.
 *
 * **아직 리포트가 없으면 404 다** — 에러가 아니라 "아직 안 만들었다"는 뜻이라
 * 재시도를 끈다. 화면은 `ApiError.kind === 'notFound'` 를 보고 생성 버튼을 띄운다.
 */
export function useStoryReport(childId: string, storyId: string) {
  return useQuery({
    queryKey: reportKeys.detail(childId, storyId),
    queryFn: () => fetchStoryReport(storyId, childId),
    enabled: childId.length > 0 && storyId.length > 0,
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === 'generating' ? POLL_INTERVAL_MS : false,
  });
}

/**
 * 리포트 생성 요청.
 *
 * **409 를 실패로 다루지 않는다.** "이미 만드는 중"이라는 뜻이라, 원하는 상태로
 * 가고 있는 것이다. 그대로 폴링에 맡긴다.
 */
export function useGenerateStoryReport(childId: string) {
  const queryClient = useQueryClient();

  return useMutation<GenerateReportResult | null, unknown, string>({
    mutationFn: async (storyId) => {
      try {
        return await generateStoryReport(storyId, childId);
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.kind === 'conflict') return null;
        throw apiError;
      }
    },
    onSuccess: (_result, storyId) => {
      // 상태가 바뀌었으니 조회를 다시 시작시킨다. generating 이면 위 폴링이 이어받는다.
      void queryClient.invalidateQueries({ queryKey: reportKeys.detail(childId, storyId) });
    },
  });
}

/** 화면이 "아직 리포트가 없다"와 진짜 오류를 구분할 때 쓴다. */
export function isReportMissing(error: unknown): boolean {
  return toApiError(error).kind === 'notFound';
}

export type { StoryReport };
