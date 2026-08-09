import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import BrickHouse from '@assets/cards/brick-house.svg';
import StrawHouse from '@assets/cards/straw-house.svg';
import Together from '@assets/cards/together.svg';
import Wolf from '@assets/cards/wolf.svg';
import WoodHouse from '@assets/cards/wood-house.svg';

/** 이야기를 마친 뒤 되짚어보는 활동에 쓰는 장면 카드. */
export interface StoryCard {
  id: string;
  label: string;
  Icon: FC<SvgProps>;
}

export interface StoryActivity {
  storyId: string;
  /** **정답 순서대로** 담는다. 화면에 보여줄 때는 `shuffledIds` 순서를 쓴다. */
  cards: readonly StoryCard[];
  /** 처음 깔아주는 순서. 디자인(92:993)의 배열을 그대로 옮겼다. */
  shuffledIds: readonly string[];
  /** 이야기에서 건진 낱말. 단어장으로 이어질 값이다. */
  keywords: readonly string[];
  /**
   * 아이가 이야기를 다시 말했다고 가정할 문장 (활동 2/2).
   *
   * TODO: STT 가 붙으면 사라진다. 지금은 마이크를 누르면 이게 대신 적힌다.
   */
  retellSample: string;
}

const PIGS_ACTIVITY: StoryActivity = {
  storyId: '3',
  cards: [
    { id: 'straw', label: '가벼운 지푸라기집', Icon: StrawHouse },
    { id: 'wood', label: '나무로 만든 집', Icon: WoodHouse },
    { id: 'brick', label: '튼튼한 벽돌집', Icon: BrickHouse },
    { id: 'wolf', label: '늑대가 찾아왔어요', Icon: Wolf },
    { id: 'together', label: '셋이 함께 안전해요', Icon: Together },
  ],
  shuffledIds: ['wolf', 'brick', 'straw', 'together', 'wood'],
  keywords: ['용감한', '친구', '숲', '모험'],
  retellSample:
    '옛날 옛적에 아기 돼지 삼형제가 살았어요. 지푸라기집이랑 나무집은 늑대가 후 불어서 무너졌는데, 벽돌집은 튼튼해서 안 무너졌어요. 그래서 삼형제가 다 같이 안전하게 지냈어요.',
};

const ACTIVITIES: readonly StoryActivity[] = [PIGS_ACTIVITY];

export function findActivity(storyId: string): StoryActivity | undefined {
  return ACTIVITIES.find((activity) => activity.storyId === storyId);
}

/** 화면에 깔아줄 순서대로 카드를 돌려준다. */
export function shuffledCards(activity: StoryActivity): readonly StoryCard[] {
  return activity.shuffledIds
    .map((id) => activity.cards.find((card) => card.id === id))
    .filter((card): card is StoryCard => card !== undefined);
}

/** 아이가 고른 순서가 정답인지. */
export function isCorrectOrder(activity: StoryActivity, pickedIds: readonly string[]): boolean {
  return (
    pickedIds.length === activity.cards.length &&
    pickedIds.every((id, index) => activity.cards[index]?.id === id)
  );
}
