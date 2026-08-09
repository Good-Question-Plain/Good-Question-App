import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import BearSleep from '@assets/stories/bear-sleep.svg';
import Cinderella from '@assets/stories/cinderella.svg';
import Oz from '@assets/stories/oz.svg';
import PeterPan from '@assets/stories/peterpan.svg';
import Pigs from '@assets/stories/pigs.svg';
import Raccoon from '@assets/stories/raccoon.svg';

/** 카테고리 칩. 디자인(125:115)의 순서를 따른다. */
export const STORY_CATEGORIES = ['전체', '우정', '용기', '감정', '상상', '모험'] as const;
export type StoryCategory = (typeof STORY_CATEGORIES)[number];

export interface Story {
  id: string;
  title: string;
  /** 예상 소요 시간(분). 화면에는 "약 14분"으로 보여준다. */
  minutes: number;
  /** 카드에 붙는 태그. 카테고리 필터와는 별개 값일 수 있어 문자열로 둔다. */
  tag: string;
  Icon: FC<SvgProps>;

  // --- 상세 화면에서만 쓰는 값들 ---
  /** 상세 화면 상단의 태그 묶음. 목록의 `tag` 를 포함한다. */
  tags?: readonly string[];
  /** 줄거리 */
  summary?: string;
  /** "너는 이 이야기에서..." 아래 들어가는, 아이가 맡을 역할 안내 */
  roleGuide?: string;
  characters?: readonly string[];
}

/** 아이가 읽다 만 이야기. 실제로는 아이별 학습 기록에서 온다. */
export interface StoryProgress {
  storyId: string;
  /** 진행률 0~1 */
  ratio: number;
}

export function findStory(id: string): Story | undefined {
  return MOCK_STORIES.find((story) => story.id === id);
}

/**
 * 백엔드 API 가 붙기 전까지 화면 확인용으로 쓰는 임시 데이터.
 * 제목·시간·태그 모두 디자인에 적힌 값 그대로다.
 */
export const MOCK_STORIES: readonly Story[] = [
  { id: '1', title: '너구리의 도토리', minutes: 14, tag: '자연', Icon: Raccoon },
  { id: '2', title: '곰의 겨울잠', minutes: 12, tag: '자연', Icon: BearSleep },
  {
    id: '3',
    title: '아기돼지 삼형제',
    minutes: 15,
    tag: '우정',
    Icon: Pigs,
    tags: ['우정', '협력'],
    summary:
      '세 마리의 형제 돼지가 각자 다른 방식으로 집을 짓고, 늑대를 만나 함께 지혜롭게 문제를 해결해가는 이야기입니다.',
    roleGuide:
      '가장 막내 돼지가 되어 형제들을 보호하고, 늑대와의 만남에서 어떻게 대처할지 결정해보세요!',
    characters: ['첫째 돼지', '둘째 돼지', '셋째 돼지', '늑대'],
  },
  { id: '4', title: '신데렐라', minutes: 18, tag: '상상', Icon: Cinderella },
  { id: '5', title: '피터팬', minutes: 20, tag: '모험', Icon: PeterPan },
  { id: '6', title: '오즈의 마법사', minutes: 22, tag: '상상', Icon: Oz },
] as const;

/** 홈의 "이어하기" 자리에 쓰는 임시 진행 상태. 디자인(78:184)의 값 그대로다. */
export const MOCK_PROGRESS: StoryProgress = { storyId: '1', ratio: 0.45 };
