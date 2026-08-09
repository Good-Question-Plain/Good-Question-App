import type { TextStyle } from 'react-native';

/**
 * 타이포그래피 토큰. Figma 파일(굿퀘스천)의 텍스트 스타일을 옮긴 것이다.
 *
 * RN 에서 한글 폰트는 `fontWeight` 로 굵기를 바꾸면 안드로이드에서 가짜 볼드(합성)가
 * 걸려 자간이 뭉개진다. 그래서 **굵기마다 별도 폰트 패밀리**를 지정한다.
 * 여기 `fontFamily` 문자열은 `fonts.ts` 의 로딩 키와 정확히 일치해야 한다.
 */

export const fontFamily = {
  regular: 'Pretendard-Regular',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  black: 'Pretendard-Black',
} as const;

/**
 * 각 키가 하나의 완결된 텍스트 스타일이다. `<Text variant="body" />` 처럼 쓰고,
 * fontSize / fontFamily 를 화면에서 직접 지정하지 않는다.
 *
 * 값은 디자인에서 실측한 것이고, 디자인에 없던 단계는 만들지 않았다.
 * 새 화면을 퍼블리싱하다 없는 단계가 나오면 여기에 추가한다.
 */
export const typography = {
  /** 서비스 로고 "굿 퀘스천" — 48/Black */
  brand: { fontFamily: fontFamily.black, fontSize: 48, lineHeight: 58 },
  /** 화면 제목 — 28/Bold */
  title: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 38 },
  /** 로고 아래 서브카피 — 24/SemiBold */
  subtitle: { fontFamily: fontFamily.semiBold, fontSize: 24, lineHeight: 26 },
  /** 단어 상세의 소제목 — 20/SemiBold */
  subheading: { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 28 },
  /** 섹션/모달 제목 — 17/SemiBold */
  heading: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 24 },
  /** 입력 라벨 — 16/SemiBold, 자간 0.1 */
  label: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24, letterSpacing: 0.1 },
  /** 본문 — 16/Regular */
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  /** 큰 본문 (홈 인사말 아래 서브카피) — 20/Regular */
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 20, lineHeight: 24 },
  /** 버튼 라벨 — 16/Bold */
  button: { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 24 },
  /** 작은 버튼 라벨 — 15/Bold */
  buttonSmall: { fontFamily: fontFamily.bold, fontSize: 15, lineHeight: 22 },
  /** 큰 버튼 라벨 (홈 "이어하기") — 20/Bold */
  buttonLarge: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 27 },
  /** 화면 대제목 (탭 화면) — 32/Bold */
  display: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 42 },
  /** 단어장 카드의 단어 — 24/Bold */
  word: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 32 },
  /** 원형 뱃지 안 글자(큰 것) — 14/Bold */
  badgeLarge: { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 18 },
  /** 원형 뱃지 안 글자 — 12/Bold */
  badge: { fontFamily: fontFamily.bold, fontSize: 12, lineHeight: 16 },
  /** 카테고리 칩 — 13/SemiBold */
  chip: { fontFamily: fontFamily.semiBold, fontSize: 13, lineHeight: 18 },
  /** 작은 라벨 (아바타 이름, 선택 상태) — 15/SemiBold */
  labelSmall: { fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 20 },
  /** 작은 보조 라벨 (아바타 이름, 기본 상태) — 12/Regular */
  captionSmall: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  /** 인증코드 한 글자 — 20/SemiBold */
  otp: { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 24 },
  /** 강조된 보조 설명 (라벨) — 14/SemiBold */
  captionStrong: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20 },
  /** 보조 설명 — 13/Regular */
  caption: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  /** 가장 작은 안내 문구 — 11/Regular */
  footnote: { fontFamily: fontFamily.regular, fontSize: 11, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
