/**
 * 보호자 리포트 화면이 쓰는 모양.
 *
 * **서버 응답 그대로가 아니다.** 컴포넌트들이 디자인에 맞춰 이미 짜여 있어서,
 * 서버 리포트를 `model/fromApi.ts` 에서 한 번 이 모양으로 옮겨 넣는다.
 * 서버 필드명과의 대응표도 그 파일에 있다.
 */

/** 리포트 안의 탭. 순서는 디자인(284:202)을 따른다. */
export const REPORT_TABS = ['어휘', '표현', '논리'] as const;
export type ReportTab = (typeof REPORT_TABS)[number];

export interface ReportVocabulary {
  /** 아이가 이야기 중 실제로 쓴 말들 */
  used: readonly string[];
  /** 아이가 뜻을 물어본 말들. 단어장에 쌓이는 것과 같은 목록이다. */
  asked: readonly string[];
  /** 자주 쓴 말버릇. 따옴표째 한 줄에 늘어놓는다. */
  phrases: readonly string[];
  /**
   * 말버릇 아래 붙는 한 줄 해설.
   *
   * **서버는 이 값을 주지 않는다** (`vocabulary` 응답에 대응 필드가 없다).
   * 디자인에는 있어서 자리를 남겨두되, 없으면 그 줄을 그리지 않는다.
   */
  phraseNote?: string;
  /** 어휘 피드백 본문 */
  feedback: string;
}

/**
 * 표현·논리 탭에 들어가는 카드 한 장 (252:251).
 *
 * "무엇을 봤는지(title) → 어땠는지(summary) → 실제로 한 말(quote) →
 * 잘한 점과 더 해볼 점(notes)" 순으로 좁혀간다.
 */
export interface ReportSkill {
  title: string;
  summary: string;
  /**
   * 아이가 실제로 한 말. **비어 있을 수 있다** — 서버는 해당 항목에서
   * 인용할 발화를 못 찾으면 빈 배열을 준다. 그때는 인용 상자를 그리지 않는다.
   */
  quotes: readonly string[];
  /**
   * 잘한 점과 더 해보면 좋을 점.
   *
   * 디자인은 두 줄이지만 **서버는 둘 중 하나만 줄 수 있다**
   * (잘한 항목은 `strength`, 아쉬운 항목은 `tip` 만 채워서 온다).
   * 그래서 고정 길이가 아니라 배열이다.
   */
  notes: readonly string[];
}

/** 집에서 이어갈 대화 주제 하나 (252:311). */
export interface ReportTopic {
  question: string;
  /** 이 질문이 어떤 연습이 되는지 */
  practice: string;
}

export interface LearningReport {
  id: string;
  /** 어느 이야기의 리포트인지. 이야기 그림을 찾을 때 쓴다. */
  storyId: string;
  storyTitle: string;
  /** 이야기를 마친 시각 (ISO 8601) */
  completedAt: string;
  /** 말하기 특징 요약. 화면 위쪽 주황 테두리 카드에 들어간다. */
  trait: string;
  vocabulary: ReportVocabulary;
  expression: readonly ReportSkill[];
  logic: readonly ReportSkill[];
  /** 오늘의 대표 발화 */
  highlight: { quote: string; reason: string };
  /** 이야기 주제 이어가기 */
  storyTopics: readonly ReportTopic[];
  /** 일상생활로 연결하기 */
  dailyTopics: readonly ReportTopic[];
}

/**
 * "2026년 8월 5일 오후 3:24" 형식.
 *
 * `Intl.DateTimeFormat` 은 안드로이드 Hermes 빌드에 따라 한국어 로케일 데이터가
 * 빠져 있을 수 있어 직접 조립한다.
 */
export function formatReportDate(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const meridiem = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${meridiem} ${hour12}:${minutes}`;
}
