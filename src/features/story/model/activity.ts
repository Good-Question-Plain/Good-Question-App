import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

/**
 * 이야기를 마친 뒤 되짚어보는 활동에 쓰는 장면 카드.
 *
 * 서버(`GET /sessions/{id}/post-activity`)가 주는 카드를 화면 모양으로 옮긴 것이다.
 * 그림은 **둘 중 하나**로 온다 — 서버가 주는 `imageUrl`, 또는 디자인에서 내보낸
 * 번들 `Icon`. 서버가 그림을 안 주는 이야기도 있어서 둘 다 받는다.
 */
export interface StoryCard {
  /** 서버의 `scene_id`. 순서를 제출할 때 이 값을 보낸다. */
  id: string;
  label: string;
  Icon?: FC<SvgProps>;
  imageUrl?: string;
}
