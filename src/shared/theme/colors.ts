/**
 * 색상 토큰. Figma 파일(굿퀘스천)의 Variables 를 그대로 옮긴 것이다.
 *
 * `palette` 는 원시 색상값(raw), `colors` 는 의미 기반 별칭(semantic)이다.
 * 화면/컴포넌트에서는 항상 `colors` 만 참조한다.
 *
 * Figma 에서는 중립 스케일 이름이 `Netutral/*` 로 오타가 나 있지만, 코드에서는
 * `neutral` 로 적는다. 숫자(50/300/400/500…)는 Figma 와 1:1로 대응한다.
 */

const palette = {
  // primary (Figma: primary/*)
  primary50: '#FFFBF6',
  primary150: '#FFEEC2',
  primary200: '#FFDB99',
  primary250: '#FFCB6B',
  primary300: '#FFC266',
  primary400: '#FFA833',
  primary500: '#FF9200',
  primary600: '#E07D00',
  primary700: '#B86200',

  // neutral (Figma: Netutral/*)
  neutral0: '#FFFFFF',
  neutral50: '#F8F9FA',
  neutral300: '#DEE2E6',
  neutral400: '#CED4DA',
  neutral500: '#ADB5BD',
  // 아래 넷은 Variable 로 등록돼 있지 않고 디자인에 하드코딩돼 있던 값이다.
  // 모두 Bootstrap gray 스케일과 같은 계열이라 해당 자리에 맞춰 넣었다.
  // 디자이너가 나중에 Variable 로 승격하면 이름만 맞추면 된다.
  neutral200: '#E9ECEF',
  neutral600: '#868E96',
  neutral700: '#495057',
  neutral900: '#212529',

  /** 파괴적 액션(회원탈퇴 등). Variable 미등록, 모달에 하드코딩된 값. */
  danger500: '#DC2626',
  /** 입력 검증 통과(비밀번호 일치 등). Variable 미등록. */
  success500: '#82C91E',
  /** 인증코드 남은 시간 표시. Variable 미등록. */
  warning500: '#F59E0B',

  // 살구빛 계열. primary 스케일과 색상(hue)이 달라 따로 둔다.
  // 이야기 카드 썸네일과 상세 화면 안내 블록 배경에 쓰인다. Variable 미등록.
  peach50: '#FFF8F0',
  peach150: '#FFE4CC',

  // 소셜 로그인 브랜드
  kakaoLogo: '#000000',
} as const;

export const colors = {
  // 배경
  background: palette.neutral50,
  surface: palette.neutral0,
  /** 카드/패널용 은은한 주황 배경 (로그인 폼 컨테이너 등) */
  surfaceAccent: palette.primary50,
  /** 상세 화면의 안내 블록처럼 따뜻한 톤의 옅은 배경 */
  surfaceAccentWarm: palette.peach50,
  /** 눌림 상태·보조 버튼·정보 블록 배경 */
  surfaceMuted: palette.neutral200,

  // 텍스트
  text: palette.neutral900,
  textStrong: palette.neutral700,
  textMuted: palette.neutral600,
  textSubtle: palette.neutral500,
  textInverse: palette.neutral0,
  /** 입력 placeholder. 디자인상 #757575 인데 중립 스케일에 없는 단발성 값이다. */
  textPlaceholder: '#757575',

  // 선/구분
  border: palette.neutral300,
  borderStrong: palette.neutral400,
  divider: palette.neutral300,

  // 브랜드 / 주요 액션
  primary: palette.primary500,
  primaryPressed: palette.primary600,
  primarySoft: palette.primary400,
  /** 비활성/약한 강조 버튼 배경 */
  primaryMuted: palette.primary300,
  primarySubtle: palette.primary50,
  /** 링크·강조 텍스트 */
  primaryText: palette.primary600,
  /** 축하 화면 제목처럼 더 진한 브랜드 텍스트 */
  primaryTextDeep: palette.primary700,
  /** 선택 가능한 칩·아바타의 옅은 주황 배경 */
  primarySelected: palette.primary150,
  /** 장식용 점 (회원가입 완료 화면) */
  decorLight: palette.primary200,
  decorMid: palette.primary250,

  // 상태
  danger: palette.danger500,
  dangerPressed: palette.danger500,
  success: palette.success500,
  /** 남은 시간 카운트다운 */
  timer: palette.warning500,

  // 비활성
  disabled: palette.neutral300,
  disabledText: palette.neutral500,

  /** 모달 배경. 디자인 값 그대로 (neutral900 @ 50%). */
  overlay: 'rgba(33, 37, 41, 0.5)',

  kakaoLogo: palette.kakaoLogo,
} as const;

export type ColorToken = keyof typeof colors;

/**
 * 아바타 배경 톤. 디자인이 아이마다 세 톤을 번갈아 쓴다
 * (선택된 아바타는 항상 가장 옅은 톤 + 주황 테두리).
 *
 * `colors` 안에 두지 않는 이유: `colors` 의 값은 전부 단일 색 문자열이어야
 * `Text` 의 `color` prop 같은 토큰 참조가 타입으로 보장된다.
 */
export const avatarTints = [palette.primary150, palette.primary200, palette.primary250] as const;

/**
 * 이야기 카드 썸네일 배경. 목록에서 카드마다 돌아가며 쓴다.
 * 값과 순서 모두 디자인(125:115) 실측.
 */
export const storyTints = [
  palette.primary150,
  palette.primary200,
  palette.primary250,
  palette.peach150,
  palette.peach50,
] as const;
