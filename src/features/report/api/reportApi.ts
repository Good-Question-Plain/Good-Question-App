import { request } from '@/shared/api';

/**
 * 보호자 리포트 API (2026-08-15 명세에 새로 생겼다).
 *
 * 경로에 `/api` 를 붙이지 않는다 (근거는 `features/auth/api/authApi.ts` 주석).
 *
 * **리포트는 자동으로 만들어지지 않는다.** 이야기를 끝냈다고 생기는 게 아니라
 * `POST /reports/{story_id}/generate` 를 불러야 한다. 생성은 백그라운드로 돌아서
 * 202 만 돌아오고, 결과는 `GET /reports/{story_id}` 로 다시 물어봐야 한다.
 */

/** 생성 상태. `generating` 이면 본문 필드가 비어 있을 수 있다. */
export type ReportStatus = 'generating' | 'completed' | 'failed';

/** 표현 탭의 3항목. 서버가 이 key 를 고정으로 준다. */
export type ExpressionKey = 'perspective_empathy' | 'emotion_expression' | 'interaction';
/** 논리 탭의 2항목. 역시 고정이다. */
export type LogicKey = 'thought_reason' | 'outcome_solution';

/**
 * 표현·논리 탭에 들어가는 항목 하나.
 *
 * **`strength` 와 `tip` 은 서로 배타적으로 온다** — 잘한 항목은 `strength` 가,
 * 아쉬운 항목은 `tip` 이 채워지고 다른 쪽은 null 이다. `quotes` 도 비어 있을 수 있다.
 */
export interface ReportTrait {
  key: ExpressionKey | LogicKey;
  label: string;
  description: string;
  quotes: string[];
  strength: string | null;
  tip: string | null;
}

export interface ReportRepresentative {
  messageId: string;
  text: string;
  /** `EMOTION` 같은 분류 태그. 화면에 그대로 쓰지 않고 근거로만 쓴다. */
  elements: string[];
  reason: string;
}

export interface ReportVocabulary {
  speechSummary: string;
  usedWords: string[];
  curiousWords: string[];
  expressionPatterns: string[];
  feedback: string;
}

export interface HomeConversationTopic {
  question: string;
  practiceLabel: string;
}

export interface ReportHomeConversation {
  storyTopics: HomeConversationTopic[];
  dailyLife: HomeConversationTopic[];
}

export interface StoryReport {
  reportId: string;
  sessionId: string;
  storyId: string;
  storyTitle: string;
  childName: string;
  status: ReportStatus;
  representative: ReportRepresentative | null;
  vocabulary: ReportVocabulary | null;
  expression: ReportTrait[];
  logic: ReportTrait[];
  homeConversation: ReportHomeConversation | null;
  /** 같은 아이의 **완료된 리포트가 있는** 이전/다음 이야기. 없으면 null. */
  previousStoryId: string | null;
  nextStoryId: string | null;
  /** `status === 'failed'` 일 때만 채워진다. */
  failureReason: string | null;
  /** 생성이 끝난 시각 (ISO 8601). 아직 만드는 중이면 null. */
  completedAt: string | null;
}

interface TraitDto {
  key: ExpressionKey | LogicKey;
  label: string;
  description: string;
  quotes: string[] | null;
  strength: string | null;
  tip: string | null;
}

interface TopicDto {
  question: string;
  practice_label: string;
}

interface StoryReportDto {
  report_id: string;
  session_id: string;
  story_id: string;
  story_title: string;
  child_name: string;
  status: ReportStatus;
  representative: {
    message_id: string;
    text: string;
    elements: string[] | null;
    reason: string;
  } | null;
  vocabulary: {
    speech_summary: string;
    used_words: string[] | null;
    curious_words: string[] | null;
    expression_patterns: string[] | null;
    feedback: string;
  } | null;
  expression: TraitDto[] | null;
  logic: TraitDto[] | null;
  home_conversation: {
    story_topics: TopicDto[] | null;
    daily_life: TopicDto[] | null;
  } | null;
  previous_story_id: string | null;
  next_story_id: string | null;
  failure_reason: string | null;
  completed_at: string | null;
}

function toTrait(dto: TraitDto): ReportTrait {
  return {
    key: dto.key,
    label: dto.label,
    description: dto.description,
    quotes: dto.quotes ?? [],
    strength: dto.strength,
    tip: dto.tip,
  };
}

function toTopic(dto: TopicDto): HomeConversationTopic {
  return { question: dto.question, practiceLabel: dto.practice_label };
}

/**
 * `GET /reports/{story_id}?child_id=`
 *
 * **`generating` 이면 알맹이가 비어 있을 수 있다.** 그래서 배열 필드는 전부
 * `?? []` 로 받는다 — 화면이 `.map` 에서 터지지 않게 하려는 것이다.
 *
 * 아직 만들어진 리포트가 없으면 404 다(빈 응답이 아니다).
 */
export async function fetchStoryReport(storyId: string, childId: string): Promise<StoryReport> {
  const dto = await request<StoryReportDto>({
    url: `/reports/${storyId}`,
    params: { child_id: childId },
  });

  return {
    reportId: dto.report_id,
    sessionId: dto.session_id,
    storyId: dto.story_id,
    storyTitle: dto.story_title,
    childName: dto.child_name,
    status: dto.status,
    representative:
      dto.representative === null
        ? null
        : {
            messageId: dto.representative.message_id,
            text: dto.representative.text,
            elements: dto.representative.elements ?? [],
            reason: dto.representative.reason,
          },
    vocabulary:
      dto.vocabulary === null
        ? null
        : {
            speechSummary: dto.vocabulary.speech_summary,
            usedWords: dto.vocabulary.used_words ?? [],
            curiousWords: dto.vocabulary.curious_words ?? [],
            expressionPatterns: dto.vocabulary.expression_patterns ?? [],
            feedback: dto.vocabulary.feedback,
          },
    expression: (dto.expression ?? []).map(toTrait),
    logic: (dto.logic ?? []).map(toTrait),
    homeConversation:
      dto.home_conversation === null
        ? null
        : {
            storyTopics: (dto.home_conversation.story_topics ?? []).map(toTopic),
            dailyLife: (dto.home_conversation.daily_life ?? []).map(toTopic),
          },
    previousStoryId: dto.previous_story_id,
    nextStoryId: dto.next_story_id,
    failureReason: dto.failure_reason,
    completedAt: dto.completed_at,
  };
}

export interface GenerateReportResult {
  reportId: string;
  sessionId: string;
  status: ReportStatus;
}

/**
 * `POST /reports/{story_id}/generate?child_id=` — 202 Accepted.
 *
 * **이미 완료된 리포트가 있으면 다시 만들지 않고 그대로 돌려준다**(그때도 202,
 * `status: 'completed'`). `failed` 면 다시 불러 재생성한다.
 *
 * 생성 중에 또 부르면 409 다 — 실패가 아니라 "아직 만드는 중"이라는 뜻이므로
 * 화면에서는 기다리라고 안내해야 한다.
 */
export async function generateStoryReport(
  storyId: string,
  childId: string,
): Promise<GenerateReportResult> {
  const dto = await request<{ report_id: string; session_id: string; status: ReportStatus }>({
    method: 'POST',
    url: `/reports/${storyId}/generate`,
    params: { child_id: childId },
  });

  return { reportId: dto.report_id, sessionId: dto.session_id, status: dto.status };
}
