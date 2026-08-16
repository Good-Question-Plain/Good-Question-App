import { request } from '@/shared/api';

/**
 * 이야기 목록 / 메인 화면 API.
 *
 * 경로에 `/api` 를 붙이지 않는다. 이 두 엔드포인트는 **명세 상세 페이지에도
 * `/stories` · `/main` 으로 적혀 있어** 다른 그룹과 표기가 엇갈리는데,
 * 배포 서버가 받는 건 이쪽이다 (근거는 `features/auth/api/authApi.ts` 주석).
 *
 * **`GET /main` 은 아직 서버에 없다** — 2026-08-15 기준 404 다.
 * `/stories` 는 401 을 주므로 매핑돼 있다.
 */

interface StorySummaryDto {
  id: string;
  title: string;
  thumbnail_url: string | null;
  estimated_minutes: number;
  topics: string[];
  /** 서버가 주는데 명세에도 화면에도 없다. 쓰지 않는다. */
  difficulty?: string;
}

/**
 * 목록 응답에서 배열을 꺼낸다.
 *
 * **명세는 배열인데 서버는 `{ items, total, limit, offset }` 로 감싸서 준다.**
 * 실기기에서 확인했다 — 이걸 그대로 `.map` 하면 화면이 통째로 빈다
 * (단어장에서도 같은 일이 있었다: `parseWordList`).
 * 어느 쪽이 배포될지 앱이 정할 수 없으니 둘 다 받는다.
 */
function toStoryList(
  payload: StorySummaryDto[] | { items?: StorySummaryDto[] },
): StorySummaryDto[] {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? [];
}

/** 목록에 쓰는 이야기 한 편. 화면이 쓰던 `Story` 와 달리 그림이 URL 로 온다. */
export interface StorySummary {
  id: string;
  title: string;
  /** 예상 소요 시간(분). 화면에는 "약 14분"으로 보여준다. */
  minutes: number;
  /** 주제 태그. 첫 번째를 카드 태그로 쓴다. */
  topics: string[];
  /** 서버가 주는 표지 그림. 없을 수 있다. */
  thumbnailUrl: string | null;
}

function toSummary(dto: StorySummaryDto): StorySummary {
  return {
    id: dto.id,
    title: dto.title,
    minutes: dto.estimated_minutes,
    topics: dto.topics,
    thumbnailUrl: dto.thumbnail_url === '' ? null : dto.thumbnail_url,
  };
}

/**
 * `GET /stories?topic=` — 주제 필터. '전체'거나 값이 없으면 전부 준다.
 * 해당하는 이야기가 없으면 빈 배열이다(404 가 아니다).
 */
export async function fetchStories(topic?: string): Promise<StorySummary[]> {
  const payload = await request<StorySummaryDto[] | { items?: StorySummaryDto[] }>({
    url: '/stories',
    params: topic === undefined || topic === '전체' ? undefined : { topic },
  });
  return toStoryList(payload).map(toSummary);
}

/** 읽다 만 이야기. 없으면 `continue_story` 가 null 로 온다. */
export interface ContinueStory {
  storyId: string;
  title: string;
  thumbnailUrl: string | null;
  /** 진행률 0~1. 서버는 0~100 정수로 준다. */
  ratio: number;
}

export interface MainPage {
  continueStory: ContinueStory | null;
  recommended: StorySummary[];
}

interface MainPageDto {
  continue_story: {
    story_id: string;
    title: string;
    thumbnail_url: string | null;
    progress_percentage: number;
  } | null;
  recommended_stories: StorySummaryDto[] | { items?: StorySummaryDto[] };
}

/**
 * `GET /main?child_id=` — 홈 화면 한 방 조회.
 *
 * `child_id` 가 빠지거나 형식이 틀리면 422 다. 활성 아이가 정해지기 전에는
 * 부르지 않아야 한다(`queries.ts` 의 `enabled`).
 */
export async function fetchMainPage(childId: string): Promise<MainPage> {
  const dto = await request<MainPageDto>({ url: '/main', params: { child_id: childId } });

  return {
    continueStory:
      dto.continue_story === null
        ? null
        : {
            storyId: dto.continue_story.story_id,
            title: dto.continue_story.title,
            thumbnailUrl:
              dto.continue_story.thumbnail_url === '' ? null : dto.continue_story.thumbnail_url,
            // 화면의 진행바는 0~1 을 받는다. 여기서 한 번만 바꿔둔다.
            ratio: dto.continue_story.progress_percentage / 100,
          },
    // `/stories` 처럼 감싸서 올 수 있다 (`toStoryList` 주석 참고).
    recommended: toStoryList(dto.recommended_stories).map(toSummary),
  };
}
