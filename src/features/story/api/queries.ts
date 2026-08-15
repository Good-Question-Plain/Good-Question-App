import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchPostActivity,
  submitCardOrder,
  submitRetelling,
  type RetellResult,
  type SubmitOrderResult,
} from './activityApi';
import {
  completeStep,
  enterStep,
  fetchActiveSession,
  fetchStoryProgress,
  speak,
  startStorySession,
  type SessionStep,
  type SpeakResult,
  type StepProgress,
  type StorySession,
} from './progressApi';
import { fetchMainPage, fetchStories } from './storyApi';

export const storyKeys = {
  all: ['story'] as const,
  list: (topic: string) => [...storyKeys.all, 'list', topic] as const,
  main: (childId: string) => [...storyKeys.all, 'main', childId] as const,
  postActivity: (sessionId: string) => [...storyKeys.all, 'post-activity', sessionId] as const,
  activeSession: (childId: string) => [...storyKeys.all, 'active-session', childId] as const,
  progress: (childId: string, storyId: string) =>
    [...storyKeys.all, 'progress', childId, storyId] as const,
};

/**
 * 그 이야기의 진행 상태. 앱을 껐다 켠 뒤 읽던 자리로 돌아갈 때 쓴다.
 *
 * **세션이 없으면 404 다** — 빈 응답이 아니라 에러다. 호출부는
 * `ApiError.kind === 'notFound'` 를 "아직 시작 안 함"으로 읽어야 한다.
 * 그래서 재시도를 끄고 둔다(없는 걸 세 번 더 물어볼 이유가 없다).
 */
export function useStoryProgress(childId: string, storyId: string) {
  return useQuery({
    queryKey: storyKeys.progress(childId, storyId),
    queryFn: () => fetchStoryProgress(storyId, childId),
    enabled: childId.length > 0 && storyId.length > 0,
    retry: false,
  });
}

interface StepInput {
  storyId: string;
  stepIndex: number;
}

/** 단계 진입. 현재 단계 재진입이거나 바로 다음 단계여야 한다(아니면 409). */
export function useEnterStep(childId: string) {
  return useMutation<SessionStep, unknown, StepInput>({
    mutationFn: ({ storyId, stepIndex }) => enterStep(storyId, stepIndex, childId),
  });
}

/** 내레이션 완료. 마지막 장면이면 `completed: true` 가 와서 활동으로 넘어간다. */
export function useCompleteStep(childId: string) {
  const queryClient = useQueryClient();

  return useMutation<StepProgress, unknown, StepInput>({
    mutationFn: ({ storyId, stepIndex }) => completeStep(storyId, stepIndex, childId),
    onSuccess: (_result, { storyId }) => {
      void queryClient.invalidateQueries({ queryKey: storyKeys.progress(childId, storyId) });
      void queryClient.invalidateQueries({ queryKey: storyKeys.activeSession(childId) });
    },
  });
}

interface SpeakInput extends StepInput {
  audio: { uri: string; name: string; type: string };
}

/**
 * 아이 음성 업로드.
 *
 * **서버의 STT·대사 생성이 아직 비어 있다.** 지금 붙이면 `child_text` 가 빈
 * 문자열로 오고 대화 장면이 끝나지 않는다 — 화면을 연결하기 전에 BE 확인이 필요하다.
 */
export function useSpeak(childId: string) {
  return useMutation<SpeakResult, unknown, SpeakInput>({
    mutationFn: ({ storyId, stepIndex, audio }) => speak(storyId, stepIndex, childId, audio),
  });
}

/** 진행 중인 이야기. 없으면 데이터가 null 이다(에러가 아니다). */
export function useActiveSession(childId: string) {
  return useQuery({
    queryKey: storyKeys.activeSession(childId),
    queryFn: () => fetchActiveSession(childId),
    enabled: childId.length > 0,
  });
}

/**
 * 이야기를 시작(또는 이어하기)한다.
 *
 * **409 를 실패로 다루면 안 된다.** 다른 이야기가 진행 중이라는 뜻이고,
 * 화면에서는 그 이야기를 마저 보겠냐고 물어야 한다. 호출부가
 * `ApiError.kind === 'conflict'` 로 갈라 쓴다.
 */
export function useStartStorySession(childId: string) {
  const queryClient = useQueryClient();

  return useMutation<StorySession, unknown, string>({
    mutationFn: (storyId) => startStorySession(storyId, childId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storyKeys.activeSession(childId) });
      void queryClient.invalidateQueries({ queryKey: storyKeys.main(childId) });
    },
  });
}

/** 이야기 목록. 카테고리 칩이 바뀌면 queryKey 가 바뀌어 자동으로 다시 받는다. */
export function useStories(topic: string) {
  return useQuery({
    queryKey: storyKeys.list(topic),
    queryFn: () => fetchStories(topic),
  });
}

/**
 * 홈 화면 데이터(이어하기 + 추천).
 *
 * `child_id` 가 없으면 서버가 422 를 주므로 활성 아이가 정해지기 전에는
 * 요청하지 않는다.
 */
export function useMainPage(childId: string) {
  return useQuery({
    queryKey: storyKeys.main(childId),
    queryFn: () => fetchMainPage(childId),
    enabled: childId.length > 0,
  });
}

/**
 * 이야기 후 활동의 카드 묶음.
 *
 * **`staleTime: Infinity` 다.** 서버가 매 요청마다 카드 순서를 무작위로 섞어
 * 주기 때문에, 아이가 카드를 배열하는 중에 다시 받아오면 **눈앞에서 카드가
 * 뒤섞인다.** 다시 섞고 싶으면 명시적으로 무효화한다.
 */
export function usePostActivity(sessionId: string) {
  return useQuery({
    queryKey: storyKeys.postActivity(sessionId),
    queryFn: () => fetchPostActivity(sessionId),
    enabled: sessionId.length > 0,
    staleTime: Infinity,
  });
}

export function useSubmitCardOrder(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation<SubmitOrderResult, unknown, string[]>({
    mutationFn: (sceneIds) => submitCardOrder(sessionId, sceneIds),
    onSuccess: (result) => {
      // 시도 횟수·완료 여부가 바뀌었으니 맞춰둔다. 다만 정답을 맞힌 뒤에만
      // 다시 받는다 — 오답일 때 받아오면 카드가 새로 섞여 아이가 방금 놓은
      // 배열이 사라진다.
      if (result.isCorrect) {
        void queryClient.invalidateQueries({ queryKey: storyKeys.postActivity(sessionId) });
      }
    },
  });
}

export function useSubmitRetelling(sessionId: string) {
  return useMutation<RetellResult, unknown, string>({
    mutationFn: (retellingText) => submitRetelling(sessionId, retellingText),
  });
}
