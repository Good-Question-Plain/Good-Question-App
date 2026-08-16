import { create } from 'zustand';

interface LastStoryState {
  /** 마지막으로 연 이야기의 id. 아직 아무것도 안 열었으면 null. */
  lastStoryId: string | null;
  rememberStory: (storyId: string) => void;
  clear: () => void;
}

/**
 * 아이가 마지막으로 연 이야기.
 *
 * **리포트가 이걸 필요로 한다.** 리포트는 `GET /reports/{story_id}` 로 **이야기
 * 한 편당 하나**인데, 마이페이지 → "학습 리포트 보기" 로 들어올 때는 어느 이야기인지
 * 알려주는 값이 없다. 그대로 두면 화면이 아무 이야기도 못 정해서, 방금 이야기를
 * 끝낸 보호자에게도 **"아직 리포트가 없어요"** 만 보인다 (실제로 그렇게 보고됐다).
 *
 * 서버에 **리포트 목록 API 가 없어서** "가장 최근에 끝낸 이야기"를 물어볼 데가 없다.
 * `GET /progress/active` 는 *진행 중*인 것만 주는데, 리포트를 보려는 시점에는 이미
 * 끝나 있어서 null 이다. 그래서 앱이 기억한다.
 *
 * **id 만 들고 있다** (AGENTS: 서버 데이터를 zustand 에 복사하지 않는다).
 * 앱을 껐다 켜면 초기화된다 — 그때는 이야기 목록에서 다시 들어가면 된다.
 *
 * **리포트 목록 API 가 생기면 이 스토어는 지운다.**
 */
export const useLastStoryStore = create<LastStoryState>((set) => ({
  lastStoryId: null,
  rememberStory: (storyId) => set({ lastStoryId: storyId }),
  clear: () => set({ lastStoryId: null }),
}));
