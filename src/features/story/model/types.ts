import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

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
  /** 서버가 주는 표지 그림. 없으면 번들 아이콘으로 떨어진다. */
  thumbnailUrl?: string;
  Icon?: FC<SvgProps>;

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
