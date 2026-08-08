/**
 * 번들된 폰트 파일 매핑.
 *
 * 키는 `typography.ts` 의 `fontFamily` 값과 정확히 같아야 한다. RN 은 이 키를
 * 그대로 `fontFamily` 로 조회하기 때문에, 하나라도 어긋나면 조용히 시스템 폰트로
 * 폴백돼서 알아채기 어렵다.
 *
 * Pretendard v1.3.9 (SIL Open Font License 1.1) — https://github.com/orioncactus/pretendard
 */
export const fontAssets = {
  'Pretendard-Regular': require('../../../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-SemiBold': require('../../../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../../../assets/fonts/Pretendard-Bold.otf'),
  'Pretendard-Black': require('../../../assets/fonts/Pretendard-Black.otf'),
} as const;
