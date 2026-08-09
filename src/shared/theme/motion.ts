import { Easing } from 'react-native';

/**
 * 모션 토큰.
 *
 * 저연령 사용자가 쓰는 앱이라 "누른 게 반응했다"는 신호가 분명해야 하지만,
 * 느리면 답답해진다. 그래서 피드백은 짧고(120~200ms) 탄성은 낮게(오버슈트 최소)
 * 잡았다. 아이가 여러 번 빠르게 누를 때 잔상이 남지 않는 게 기준이다.
 *
 * 화면마다 duration 숫자를 직접 쓰지 말고 여기 값을 참조한다.
 *
 * 모션은 RN 내장 `Animated` 로 구현한다. 여기서 필요한 건 페이드·이동·크기·색
 * 보간 정도라 내장 API 로 충분하고, 별도 런타임에 의존하지 않아 동작을 예측하기
 * 쉽다. (Reanimated 는 react-native-gesture-handler 가 끌어와서 설치돼 있지만
 * 직접 쓰지는 않는다.) 제스처 기반 인터랙션이 필요해지면 그때 Reanimated 로
 * 올리는 게 맞다.
 */
export const motion = {
  duration: {
    /** 누름/뗌 같은 즉각 피드백 */
    fast: 120,
    /** 색·불투명도 전환 */
    base: 200,
    /** 화면 진입, 모달 등장 */
    slow: 320,
    /** 계속 도는 표시(로딩 고리) 한 바퀴. 눈이 따라갈 수 있을 만큼 느리게. */
    spin: 1200,
  },

  /**
   * 눌렀을 때 줄어드는 비율. 0.97 은 태블릿 크기 버튼에서 "눌렸다"가 보이면서도
   * 흔들려 보이지 않는 선이다.
   */
  pressScale: 0.97,

  /** 버튼처럼 되돌아오는 동작. 오버슈트가 거의 없다. */
  spring: {
    damping: 18,
    stiffness: 220,
    mass: 0.7,
  },

  /** 탭 아이콘처럼 살짝 통통 튀어야 하는 동작. */
  springBouncy: {
    damping: 11,
    stiffness: 260,
    mass: 0.7,
  },

  easing: {
    /** 들어올 때: 빠르게 시작해 부드럽게 안착 */
    out: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.quad),
  },

  /** 순차 등장에서 항목 간 지연. 너무 길면 화면이 늦게 완성된 느낌이 든다. */
  stagger: 60,
} as const;
