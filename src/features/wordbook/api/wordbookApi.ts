import { request } from '@/shared/api';

import type { WordDetail, WordEntry } from '../model/types';

/**
 * 단어장 API.
 *
 * 경로에 `/api` 를 붙이지 않는다 (근거는 `features/auth/api/authApi.ts` 주석).
 *
 * **모든 요청에 `child_id` 가 필수다.** 단어장은 아이별로 다르기 때문이다.
 * 그래서 화면이 아니라 라우트가 "지금 보고 있는 아이"를 넘겨준다
 * (wordbook feature 는 child feature 를 모른다).
 */

/**
 * 목록의 원소.
 *
 * **명세에 두 가지 모양이 적혀 있다.** 단어장 페이지의 것은 배열이고
 * `story_id`·`story_title`·`is_saved` 를 주는데, 보고서 페이지에 붙은 것은
 * `{ total, items }` 이고 `kind`·`definition`·`example_sentence` 를 준다.
 * 어느 쪽이 배포될지 앱이 정할 수 없어서 **둘 다 받도록 열어뒀다** —
 * 없는 필드는 화면에서 자연스럽게 빠진다(`parseWordList`).
 */
interface WordSummaryDto {
  id: string;
  word: string;
  story_id?: string;
  story_title?: string;
  is_saved?: boolean;
  /** `used` = 이야기에서 쓴 말, `curious` = 뜻을 물어본 말. */
  kind?: 'used' | 'curious';
}

interface WordDetailDto extends WordSummaryDto {
  definition: string;
  usage_context: string;
  example_sentence: string;
  audio_url: string | null;
}

function toEntry(dto: WordSummaryDto): WordEntry {
  return {
    id: dto.id,
    word: dto.word,
    storyId: dto.story_id ?? '',
    // 이야기 제목이 없으면 "이야기별" 묶기에서 한 덩어리로 모인다.
    storyTitle: dto.story_title ?? '',
    // `is_saved` 를 안 주는 응답이면, 목록에 있다는 것 자체가 저장됐다는 뜻이다.
    saved: dto.is_saved ?? true,
    kind: dto.kind,
  };
}

/** 배열과 `{ total, items }` 를 둘 다 받는다. 어느 쪽이 올지 명세가 엇갈린다. */
function parseWordList(payload: WordSummaryDto[] | { items?: WordSummaryDto[] }): WordEntry[] {
  const items = Array.isArray(payload) ? payload : (payload.items ?? []);

  return items.map(toEntry);
}

export interface FetchWordsParams {
  childId: string;
  /** 특정 이야기의 단어만 볼 때. 단어장 전체 목록에서는 넘기지 않는다. */
  storyId?: string;
  /** `curious` 만 보고 싶을 때. 안 넘기면 전부 온다. */
  kind?: 'used' | 'curious';
}

/** `GET /vocabulary?child_id=&story_id=&kind=` */
export async function fetchWords({
  childId,
  storyId,
  kind,
}: FetchWordsParams): Promise<WordEntry[]> {
  const payload = await request<WordSummaryDto[] | { items?: WordSummaryDto[] }>({
    url: '/vocabulary',
    params: {
      child_id: childId,
      ...(storyId === undefined ? {} : { story_id: storyId }),
      ...(kind === undefined ? {} : { kind }),
    },
  });
  return parseWordList(payload);
}

/** `GET /vocabulary/{vocab_id}?child_id=` */
export async function fetchWordDetail(vocabId: string, childId: string): Promise<WordDetail> {
  const dto = await request<WordDetailDto>({
    url: `/vocabulary/${vocabId}`,
    params: { child_id: childId },
  });

  return {
    ...toEntry(dto),
    meaning: dto.definition,
    usage: dto.usage_context,
    quote: dto.example_sentence,
    audioUrl: dto.audio_url === '' ? null : dto.audio_url,
  };
}

/**
 * `POST/DELETE /vocabulary/{vocab_id}/save?child_id=` — 둘 다 204 다.
 *
 * 저장은 이미 저장돼 있으면 409 를 준다. 화면에서는 하트를 누른 결과가
 * "저장됨"이면 되는 것이라 409 를 성공으로 친다 (`queries.ts` 참고).
 */
export async function setWordSaved(
  vocabId: string,
  childId: string,
  saved: boolean,
): Promise<void> {
  await request<void>({
    method: saved ? 'POST' : 'DELETE',
    url: `/vocabulary/${vocabId}/save`,
    params: { child_id: childId },
  });
}
