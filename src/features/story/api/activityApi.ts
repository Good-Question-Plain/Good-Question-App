import { request } from '@/shared/api';
import { toRemoteImageUri } from '@/shared/lib/remoteImage';

/**
 * 이야기 후 활동 API (순서 맞추기 · 다시 말하기).
 *
 * 경로에 `/api` 를 붙이지 않는다 (근거는 `features/auth/api/authApi.ts` 주석).
 * 명세에는 이 그룹만 속성·상세 양쪽에 `/api/...` 로 적혀 있는데, 서버는
 * `/sessions/{id}/post-activity` 를 받는다(401). `/api/...` 는 404 다.
 *
 * **`session_id` 는 `POST /progress/{story_id}/start` 가 만들어준다.**
 * 그쪽이 아직 BE 미구현이라 화면을 여기에 붙이지 못하고 있다.
 */

interface ActivityCardDto {
  scene_id: string;
  title: string;
  image_url: string | null;
}

interface PostActivityDto {
  attempt_count: number;
  is_completed: boolean;
  cards: ActivityCardDto[];
}

export interface ActivityCard {
  sceneId: string;
  title: string;
  imageUrl: string | null;
}

export interface PostActivity {
  /** 지금까지 순서를 제출한 횟수. 오답 안내를 몇 번째인지에 따라 바꿀 때 쓴다. */
  attemptCount: number;
  /** 순서 맞추기 정답 + 리텔링까지 **모두** 끝났을 때만 true 다. */
  isCompleted: boolean;
  /** **매 요청마다 순서가 무작위로 섞여 온다** — 받은 순서를 정답으로 착각하면 안 된다. */
  cards: ActivityCard[];
}

/** `GET /sessions/{session_id}/post-activity` */
export async function fetchPostActivity(sessionId: string): Promise<PostActivity> {
  const dto = await request<PostActivityDto>({ url: `/sessions/${sessionId}/post-activity` });

  return {
    attemptCount: dto.attempt_count,
    isCompleted: dto.is_completed,
    cards: dto.cards.map((card) => ({
      sceneId: card.scene_id,
      title: card.title,
      imageUrl: toRemoteImageUri(card.image_url),
    })),
  };
}

export interface ActivityWord {
  word: string;
  definition: string;
}

export interface SubmitOrderResult {
  isCorrect: boolean;
  attemptCount: number;
  /** **정답일 때만 온다.** 오답이면 null 이다. */
  vocabulary: ActivityWord[] | null;
}

interface SubmitOrderDto {
  is_correct: boolean;
  attempt_count: number;
  vocabulary: ActivityWord[] | null;
}

/**
 * `POST /sessions/{session_id}/post-activity/submit`
 *
 * 아이가 배열한 씬 순서를 보내고 정오답을 받는다.
 * 이미 맞힌 활동에 다시 제출하면 400 이다.
 */
export async function submitCardOrder(
  sessionId: string,
  sceneIds: string[],
): Promise<SubmitOrderResult> {
  const dto = await request<SubmitOrderDto>({
    method: 'POST',
    url: `/sessions/${sessionId}/post-activity/submit`,
    data: { submitted_order: sceneIds },
  });

  return {
    isCorrect: dto.is_correct,
    attemptCount: dto.attempt_count,
    vocabulary: dto.vocabulary,
  };
}

export interface RetellResult {
  storyTitle: string;
  /** 이 세션에서 아이가 말한 횟수. 완료 화면의 "N번 말했어요" 가 이 값이다. */
  utteranceCount: number;
  /** 이야기의 핵심 단어 수. 완료 화면의 "단어 M개" 가 이 값이다. */
  newVocabularyCount: number;
}

interface RetellDto {
  story_title: string;
  utterance_count: number;
  new_vocabulary_count: number;
}

/**
 * `POST /sessions/{session_id}/post-activity/retell`
 *
 * 다시 말하기 결과를 저장하고 완료 화면에 띄울 수치를 받는다.
 * **순서 맞추기를 먼저 끝내지 않으면 400 이다** — 활동 순서가 서버에서도 강제된다.
 */
export async function submitRetelling(
  sessionId: string,
  retellingText: string,
): Promise<RetellResult> {
  const dto = await request<RetellDto>({
    method: 'POST',
    url: `/sessions/${sessionId}/post-activity/retell`,
    data: { retelling_text: retellingText },
  });

  return {
    storyTitle: dto.story_title,
    utteranceCount: dto.utterance_count,
    newVocabularyCount: dto.new_vocabulary_count,
  };
}
