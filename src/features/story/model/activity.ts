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

/**
 * 핵심 단어를 라우트 파라미터로 넘길 때 쓰는 구분자.
 *
 * 서버는 이 낱말들을 순서 맞추기 `submit` 응답에서 **한 번만** 준다. 다시 받아올
 * 엔드포인트가 없어서 다시 말하기 화면으로 넘기려면 라우트 파라미터밖에 없다.
 * U+001F(unit separator)는 낱말에 들어갈 수 없는 문자라 쉼표와 달리 섞일 걱정이 없다.
 *
 * **넘기는 쪽(`StoryActivityScreen`)과 받는 쪽(`StoryRetellScreen`)이 같은 값을 써야
 * 한다.** 한쪽만 달라지면 낱말이 글자 단위로 쪼개져 칩이 낱자로 뜬다 (실제로 그렇게
 * 어긋나 있었다). 화면에 리터럴로 흩어 두면 **눈에 안 보이는 문자라 어긋난 걸
 * 알아챌 수 없어서** 한 곳에 모으고, 코드에서도 보이도록 코드포인트로 적는다.
 */
export const KEYWORD_SEPARATOR = String.fromCharCode(0x1f);
