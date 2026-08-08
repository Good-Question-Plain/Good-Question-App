import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import Bear from '@assets/avatars/bear.svg';
import Cat from '@assets/avatars/cat.svg';
import Dog from '@assets/avatars/dog.svg';
import Fox from '@assets/avatars/fox.svg';
import Lion from '@assets/avatars/lion.svg';
import Panda from '@assets/avatars/panda.svg';
import Rabbit from '@assets/avatars/rabbit.svg';
import Squirrel from '@assets/avatars/squirrel.svg';

export type AvatarId = 'bear' | 'fox' | 'rabbit' | 'cat' | 'dog' | 'panda' | 'lion' | 'squirrel';

export interface AvatarDef {
  id: AvatarId;
  label: string;
  Icon: FC<SvgProps>;
}

/**
 * 선택 가능한 아바타. 순서와 이름은 디자인(92:808)을 따른다.
 *
 * 아바타 그림은 색이 그림 자체에 들어 있어 `currentColor` 로 바꾸지 않았다.
 * (탭 아이콘과 달리 상태에 따라 색이 바뀌지 않는다.)
 */
export const AVATARS: readonly AvatarDef[] = [
  { id: 'bear', label: '곰', Icon: Bear },
  { id: 'fox', label: '여우', Icon: Fox },
  { id: 'rabbit', label: '토끼', Icon: Rabbit },
  { id: 'cat', label: '고양이', Icon: Cat },
  { id: 'dog', label: '강아지', Icon: Dog },
  { id: 'panda', label: '판다', Icon: Panda },
  { id: 'lion', label: '사자', Icon: Lion },
  { id: 'squirrel', label: '다람쥐', Icon: Squirrel },
] as const;

export function findAvatar(id: AvatarId): AvatarDef {
  const found = AVATARS.find((avatar) => avatar.id === id);
  // AvatarId 로 좁혀져 있어 실제로는 못 찾을 수 없지만, 저장된 값이 오래돼
  // 목록에서 사라진 경우를 대비해 첫 번째로 되돌린다.
  return found ?? AVATARS[0];
}
