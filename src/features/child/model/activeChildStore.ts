import { create } from 'zustand';

interface ActiveChildState {
  /** 지금 고른 아이의 id. 아직 아무도 안 골랐으면 null. */
  activeChildId: string | null;
  selectChild: (childId: string) => void;
  clear: () => void;
}

/**
 * 지금 어느 아이를 보고 있는지.
 *
 * **id 만 들고 있다.** 아이의 이름·나이 같은 값은 서버에서 오는 것이라
 * `useChildren()` 캐시에 그대로 두고, 여기서는 "무엇을 골랐나"만 기억한다
 * (AGENTS: 서버 데이터를 zustand 에 복사하지 않는다).
 *
 * 그전에는 홈·리포트가 각자 `useState` 로 들고 있어서 **홈에서 고른 아이가
 * 리포트로 이어지지 않았다.** 화면을 옮겨도 유지돼야 하는 값이라 전역으로 올렸다.
 *
 * 앱을 껐다 켜면 초기화된다. 마지막 선택을 기억하려면 AsyncStorage persist 를
 * 붙이면 되는데, 지금은 아이 목록이 서버에서 오므로 첫 아이로 시작해도
 * 이상하지 않아 두지 않았다.
 */
export const useActiveChildStore = create<ActiveChildState>((set) => ({
  activeChildId: null,
  selectChild: (childId) => set({ activeChildId: childId }),
  clear: () => set({ activeChildId: null }),
}));
