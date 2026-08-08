import { useWindowDimensions } from 'react-native';

/** Figma 디자인의 기준 프레임 크기. 모든 화면이 이 크기로 그려져 있다. */
export const DESIGN_WIDTH = 1024;
export const DESIGN_HEIGHT = 768;

/**
 * 태블릿 대응용 브레이크포인트. dp(논리 픽셀) 기준.
 *
 * `expanded` 가 디자인 기준 폭(1024)과 같다. 즉 대부분의 실기기 태블릿 가로는
 * expanded 에 들어오고, 디자인 그대로 렌더된다. 그보다 좁아지는 경우
 * (태블릿 세로, 분할 화면)만 medium/compact 로 떨어진다.
 */
export const breakpoints = {
  /** 폰 또는 분할 화면처럼 좁은 상태 */
  compact: 0,
  /** 태블릿 세로 */
  medium: 768,
  /** 태블릿 가로 — 디자인 기준 */
  expanded: DESIGN_WIDTH,
} as const;

export type Breakpoint = keyof typeof breakpoints;

function resolveBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.expanded) return 'expanded';
  if (width >= breakpoints.medium) return 'medium';
  return 'compact';
}

export interface Responsive {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isLandscape: boolean;
  /** 태블릿 세로 이상 (분할 화면이 아닌 상태) */
  isTablet: boolean;
  /**
   * 브레이크포인트별 값을 고르는 헬퍼.
   * 해당 브레이크포인트 값이 없으면 더 좁은 쪽으로 내려가며 찾는다.
   *
   * @example
   * const columns = select({ compact: 1, medium: 2, expanded: 3 });
   */
  select: <T>(values: Partial<Record<Breakpoint, T>> & { compact: T }) => T;
}

/**
 * 화면 크기에 따라 레이아웃을 나눌 때 쓴다.
 * 회전/분할 화면에도 반응하도록 `useWindowDimensions` 를 기반으로 한다.
 */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const breakpoint = resolveBreakpoint(width);

  const select = <T>(values: Partial<Record<Breakpoint, T>> & { compact: T }): T => {
    if (breakpoint === 'expanded') return values.expanded ?? values.medium ?? values.compact;
    if (breakpoint === 'medium') return values.medium ?? values.compact;
    return values.compact;
  };

  return {
    width,
    height,
    breakpoint,
    isLandscape: width > height,
    isTablet: breakpoint !== 'compact',
    select,
  };
}
