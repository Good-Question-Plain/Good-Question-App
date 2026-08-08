/**
 * Figma 에서 내보낸 아이콘 모음.
 *
 * 아이콘을 손으로 그리거나 아이콘 라이브러리로 대체하지 않는다 — 디자인 세트에
 * 있는 것만 쓴다. 새 아이콘이 필요하면 Figma 에서 export 해 `assets/icons/` 에
 * 넣고 여기에 한 줄 추가한다.
 *
 * 하단 탭 아이콘은 활성/비활성 색만 다르고 모양은 같아서, 원본의 고정 fill 을
 * `currentColor` 로 바꿔 하나의 에셋으로 두 상태를 모두 표현한다.
 * 색은 `color` prop 으로 넘긴다 (path 데이터는 원본 그대로다).
 */
export { default as CheckIcon } from '@assets/icons/check.svg';
export { default as CheckCircleIcon } from '@assets/icons/check-circle.svg';
export { default as WarningIcon } from '@assets/icons/warning.svg';
export { default as CelebrateIcon } from '@assets/icons/celebrate.svg';
export { default as CameraIcon } from '@assets/icons/camera.svg';
export { default as PlusIcon } from '@assets/icons/plus.svg';

export { default as TabHomeIcon } from '@assets/icons/tab-home.svg';
export { default as TabStoryIcon } from '@assets/icons/tab-story.svg';
export { default as TabWordbookIcon } from '@assets/icons/tab-wordbook.svg';
export { default as TabMypageIcon } from '@assets/icons/tab-mypage.svg';

export { default as KakaoLogo } from '@assets/brand/kakao.svg';
export { default as NaverLogo } from '@assets/brand/naver.svg';

/** 구글 로고만 PNG 로 내보내져 있어 `<Image source={googleLogo} />` 로 쓴다. */
export const googleLogo = require('@assets/brand/google.png') as number;
