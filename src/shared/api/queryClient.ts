import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './errors';

/**
 * TanStack Query 기본 정책.
 *
 * 태블릿 전시/시연 환경을 가정해 불필요한 재요청은 줄이고,
 * 인증 실패(401/403)처럼 재시도해도 소용없는 에러는 즉시 포기한다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.kind !== 'network' && error.kind !== 'server') {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
