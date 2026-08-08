/**
 * 간격 / 모서리 / 그림자 토큰.
 *
 * 간격 스케일은 디자인에서 반복적으로 쓰인 값만 담았다. 디자인이 이 스케일을
 * 벗어나는 지점(예: 15, 17, 30, 50)이 종종 있는데, 그럴 때는 화면 파일에서
 * 실측값을 그대로 쓰되 주석으로 근거를 남긴다 — 억지로 반올림하면 디자인이 틀어진다.
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 48,
} as const;

/** 모서리 반경. 값은 전부 디자인 실측. */
export const radius = {
  none: 0,
  /** 카드 안 작은 태그 */
  xs: 6,
  /** 정보 블록, 모달 하단 버튼 */
  sm: 10,
  /** 인풋, 기본 버튼, 모달 컨테이너 */
  md: 12,
  /** 로그인 폼 카드 */
  lg: 20,
  /** 화면 셸, 알약형 요소 */
  xl: 32,
  full: 9999,
} as const;

/** 터치 타겟 최소 크기. 태블릿은 손가락이 닿는 면적이 넓어 48 이상을 권장한다. */
export const hitSize = {
  min: 48,
} as const;

/**
 * 시각적으로 작은 버튼(아이콘 하나짜리)의 터치 영역을 `hitSize.min` 까지 넓힌다.
 *
 * 크기를 키우면 디자인이 틀어지므로, 보이는 크기는 그대로 두고 눌리는 범위만
 * 넓히는 `hitSlop` 을 쓴다. 저연령 사용자는 조준이 부정확해서 작은 아이콘을
 * 여러 번 헛누르는데, 그때 "고장났다"고 인식한다.
 */
export function hitSlopFor(visualSize: number): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const extra = Math.max(0, Math.round((hitSize.min - visualSize) / 2));
  return { top: extra, bottom: extra, left: extra, right: extra };
}

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#012542',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  /** 로그인 화면 셸에 걸린 그림자: 0 24 60 rgba(1,37,66,0.14) */
  md: {
    shadowColor: '#012542',
    shadowOpacity: 0.14,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 24 },
    elevation: 12,
  },
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
