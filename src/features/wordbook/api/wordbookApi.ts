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

interface WordSummaryDto {
  id: string;
  word: string;
  story_id: string;
  story_title: string;
  is_saved: boolean;
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
    storyId: dto.story_id,
    storyTitle: dto.story_title,
    saved: dto.is_saved,
  };
}

export interface FetchWordsParams {
  childId: string;
  /** 특정 이야기의 단어만 볼 때. 단어장 전체 목록에서는 넘기지 않는다. */
  storyId?: string;
}

/** `GET /vocabulary?child_id=&story_id=` */
export async function fetchWords({ childId, storyId }: FetchWordsParams): Promise<WordEntry[]> {
  const dtos = await request<WordSummaryDto[]>({
    url: '/vocabulary',
    params: { child_id: childId, ...(storyId === undefined ? {} : { story_id: storyId }) },
  });
  return dtos.map(toEntry);
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
