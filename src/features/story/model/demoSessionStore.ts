import { create } from 'zustand';

/** 아이가 이번 이야기에서 "이거 모르겠어" 로 고른 낱말. */
export interface DemoWord {
  id: string;
  word: string;
  definition: string;
  example: string;
}

interface DemoSessionState {
  /** 어느 이야기의 기록인지. 이야기가 바뀌면 비운다. */
  storyId: string | null;
  storyTitle: string;
  /** 아이가 말한 횟수. 완료 화면의 "발화 횟수" 가 된다. */
  utterances: number;
  /** 고른 낱말들. 완료 화면의 "새로 배운 단어" 와 단어장이 된다. */
  words: DemoWord[];
  start: (storyId: string, storyTitle: string) => void;
  addUtterance: () => void;
  toggleWord: (word: DemoWord) => void;
}

/**
 * 시연 동안 아이가 남긴 것을 앱이 대신 모아둔다.
 *
 * **서버가 대화를 안 받아주기 때문에**(인수인계 1-1) 아이가 말을 해도, 낱말을 골라도
 * 서버에는 아무것도 안 쌓인다. 그래서 완료 화면 수치가 0 이고 단어장이 텅 빈다.
 * 그 자리를 채우려고 앱이 같은 것을 기억한다.
 *
 * **서버 값이 있으면 서버가 이긴다** — 이건 서버가 0/빈 배열을 줄 때만 쓰인다.
 * 백엔드가 채우기 시작하면 `demoContent` 와 함께 통째로 지운다.
 *
 * 앱을 껐다 켜면 초기화된다. 시연은 한 번에 이어서 하므로 그걸로 충분하다.
 */
export const useDemoSessionStore = create<DemoSessionState>((set, get) => ({
  storyId: null,
  storyTitle: '',
  utterances: 0,
  words: [],

  start: (storyId, storyTitle) => {
    // 같은 이야기를 이어서 보는 중이면 그동안 모은 걸 유지한다.
    if (get().storyId === storyId) {
      set({ storyTitle });
      return;
    }
    set({ storyId, storyTitle, utterances: 0, words: [] });
  },

  addUtterance: () => set((state) => ({ utterances: state.utterances + 1 })),

  toggleWord: (word) =>
    set((state) => {
      const already = state.words.some((item) => item.id === word.id);

      return {
        words: already ? state.words.filter((item) => item.id !== word.id) : [...state.words, word],
      };
    }),
}));
