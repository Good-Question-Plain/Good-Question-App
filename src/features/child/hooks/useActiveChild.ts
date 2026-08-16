import { useChildren } from '../api/queries';
import { useActiveChildStore } from '../model/activeChildStore';
import type { Child } from '../model/types';

export interface ActiveChildResult {
  /** 지금 보고 있는 아이. 목록이 비었거나 아직 로딩 중이면 undefined. */
  activeChild: Child | undefined;
  /** 전환 드롭다운에 넣을 전체 목록. */
  children: Child[];
  isLoading: boolean;
  isError: boolean;
  /** 목록을 다시 받아온다. 불러오기에 실패한 화면의 "다시 시도" 가 쓴다. */
  retry: () => void;
  selectChild: (childId: string) => void;
}

/**
 * "지금 보고 있는 아이" 를 한 번에 꺼내는 훅.
 *
 * 서버 목록(`useChildren`)과 선택 상태(`useActiveChildStore`)를 합친다.
 * 홈·리포트·마이페이지가 전부 이걸 쓰면 어느 화면에서 골라도 그대로 이어진다.
 *
 * 고른 id 가 목록에 없으면 첫 아이로 되돌린다 — 다른 기기에서 그 아이를
 * 지웠거나, 로그아웃 후 다른 계정으로 들어온 경우다. 이 경우 화면이 빈 채로
 * 남지 않아야 한다.
 */
export function useActiveChild(): ActiveChildResult {
  const { data, isLoading, isError, refetch } = useChildren();
  const activeChildId = useActiveChildStore((state) => state.activeChildId);
  const selectChild = useActiveChildStore((state) => state.selectChild);

  const children = data ?? [];
  const activeChild = children.find((child) => child.id === activeChildId) ?? children[0];

  return {
    activeChild,
    children,
    isLoading,
    isError,
    retry: () => void refetch(),
    selectChild,
  };
}
