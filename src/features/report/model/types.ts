/**
 * 보호자 리포트 한 편.
 *
 * 실제로는 아이가 이야기를 한 편 끝낼 때마다 서버가 대화 기록을 분석해 만들어
 * 내려주는 값이다. 여기 있는 건 화면 확인용 고정 데이터다.
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
  /** 말버릇 아래 붙는 한 줄 해설 */
  phraseNote: string;
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
  /** 아이가 실제로 한 말 */
  quote: string;
  /** 두 줄. 첫 줄은 잘한 점, 둘째 줄은 더 해보면 좋을 점이다. */
  notes: readonly [string, string];
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

export function findReport(id: string): LearningReport | undefined {
  return MOCK_REPORTS.find((report) => report.id === id);
}

/**
 * 화면 확인용 임시 리포트.
 *
 * 디자인(252:193)의 본문은 "방귀 뀌는 며느리" 이야기로 쓰여 있는데, 대화 화면
 * 대본과 같은 이유로 그대로 옮기지 않았다 — 서비스에 쓸 수 없는 자리표시
 * 문장이다. 화면 구조와 항목 개수는 디자인 그대로 두고, 문장만 이미 목데이터에
 * 있는 이야기로 새로 썼다 (`features/story/model/script.ts` 와 같은 방침).
 *
 * 두 편을 두는 이유는 "이전/다음 리포트 보기" 가 실제로 넘어가는지와, 양 끝에서
 * 비활성(287:273)이 되는지를 둘 다 눌러볼 수 있어야 하기 때문이다.
 * 최신 리포트가 배열 뒤에 온다.
 */
export const MOCK_REPORTS: readonly LearningReport[] = [
  {
    id: '1',
    storyId: '1',
    storyTitle: '너구리의 도토리',
    completedAt: '2026-08-03T10:12:00',
    trait:
      '지오는 이야기 속 인물이 무엇을 원하는지 잘 알아차렸어요. 자신이라면 어떻게 할지 이야기할 때 한 문장을 더 이어 말하는 연습을 하면 더 또렷하게 전할 수 있을 거예요.',
    vocabulary: {
      used: ['모으다', '나누다', '아끼다', '겨울', '배고프다'],
      asked: ['도토리', '창고'],
      phrases: ['"나라면 말이야"', '"그래서 그런가?"'],
      phraseNote: '지오는 자기 이야기로 바꿔서 말하는 걸 좋아했어요',
      feedback:
        '먹을 것과 계절에 관련된 말을 잘 골라 썼어요. 다음에는 "왜냐하면" 을 붙여 이유까지 말해보면 더 좋아요.',
    },
    expression: [
      {
        title: '관점과 공감',
        summary: '다른 인물이 무엇을 걱정하는지 알아차렸어요.',
        quote: '"너구리는 겨울에 먹을 게 없을까 봐 걱정한 것 같아."',
        notes: ['인물이 걱정하는 것을 짚어 말했어요', '그 마음이 어떨지도 함께 말해보면 더 좋아요'],
      },
      {
        title: '감정 표현',
        summary: '기분을 나타내는 말을 골라 썼어요.',
        quote: '"도토리를 나눠주니까 뿌듯했을 것 같아."',
        notes: ['상황에 맞는 기분 낱말을 찾았어요', '왜 그런 기분이 들었는지 이유를 붙여보세요'],
      },
    ],
    logic: [
      {
        title: '생각과 이유',
        summary: '자기 생각에 이유를 한 번 덧붙였어요.',
        quote: '"나눠주는 게 좋아. 혼자 먹으면 심심하니까."',
        notes: ['생각과 이유를 이어서 말했어요', '이유를 두 가지로 늘려보면 더 단단해져요'],
      },
      {
        title: '결과와 해결',
        summary: '다음에 일어날 일을 미리 그려봤어요.',
        quote: '"도토리를 다 숨기면 나중에 못 찾을 수도 있어."',
        notes: ['앞일을 예상해서 말했어요', '그럼 어떻게 하면 좋을지도 함께 생각해봐요'],
      },
    ],
    highlight: {
      quote: '"나눠주는 게 좋아. 혼자 먹으면 심심하니까."',
      reason: '자신의 선택을 말하고, 그렇게 생각한 이유를 바로 이어서 말했어요.',
    },
    storyTopics: [
      { question: '너구리는 왜 도토리를 모아두고 싶었을까?', practice: '까닭 찾기 연습' },
      { question: '친구 너구리가 배고프다고 하면 뭐라고 말해줄까?', practice: '관점과 공감 연습' },
      {
        question: '도토리를 하나도 남기지 않았다면 어떤 일이 생겼을까?',
        practice: '결과 예상 연습',
      },
    ],
    dailyTopics: [
      { question: '아껴 두었다가 나중에 잘 썼던 물건이 있어?', practice: '경험 구체화 연습' },
      {
        question: '친구가 네 것을 나눠 달라고 하면 어떤 기분이 들어?',
        practice: '타인 감정 이해 연습',
      },
      { question: '겨울이 오기 전에 우리 집은 무엇을 준비할까?', practice: '생각 확장 연습' },
    ],
  },
  {
    id: '2',
    storyId: '3',
    storyTitle: '아기돼지 삼형제',
    completedAt: '2026-08-05T15:24:00',
    trait:
      '지오는 이야기 속 인물의 감정을 잘 짐작하고 따뜻하게 공감하는 표현을 많이 사용했어요. 자신의 생각을 이야기할 때 이유를 함께 말하는 연습을 더 하면 더 풍부한 대화를 나눌 수 있을 거예요.',
    vocabulary: {
      used: ['튼튼하다', '무섭다', '도와주다', '함께', '걱정되다', '지키다'],
      asked: ['지푸라기', '벽돌'],
      phrases: ['"~인 것 같아"', '"~하면 어떨까?"'],
      phraseNote: '지오는 자신의 생각을 부드럽게 표현하는 말투를 자주 썼어요',
      feedback:
        '감정과 관련된 어휘를 다양하게 사용했어요. 다음에는 상황이나 행동을 설명하는 새로운 단어도 함께 써보면 더 재미있는 이야기가 될 거예요.',
    },
    expression: [
      {
        title: '관점과 공감',
        summary: '다른 사람의 감정을 잘 짐작하고 공감하는 말을 자주 했어요.',
        quote: '"셋째 돼지 혼자 벽돌을 쌓느라 정말 힘들었을 것 같아."',
        notes: [
          '인물의 마음을 짐작하고 자신의 말로 표현했어요',
          '왜 그렇게 느꼈는지 이유를 함께 말해보면 더 좋아요',
        ],
      },
      {
        title: '감정 표현',
        summary: '감정을 표현하는 다양한 단어를 사용했어요.',
        quote: '"첫째는 무서웠을 것 같아. 그리고 좀 후회했을 것 같기도 하고."',
        notes: [
          '두 가지 감정을 함께 표현했어요',
          '그 감정이 왜 생겼는지도 말해보는 연습을 해보세요',
        ],
      },
      {
        title: '상호작용',
        summary: '캐릭터의 질문에 자기 생각을 잘 대답했어요.',
        quote: '"응, 나도 그렇게 생각해. 셋째 집으로 다 같이 모이면 좋겠어."',
        notes: [
          '상대 말에 맞게 반응하며 자기 의견도 말했어요',
          '구체적으로 어떻게 모일지 함께 말해보세요',
        ],
      },
    ],
    logic: [
      {
        title: '생각과 이유',
        summary: '자신의 생각은 잘 말했지만, 왜 그렇게 생각했는지 이유를 덧붙이는 연습이 필요해요.',
        quote: '"늑대가 나빠."',
        notes: [
          '자기 판단을 분명하게 말했어요',
          "'왜냐하면...' 처럼 이유를 함께 말해보면 더 좋아요",
        ],
      },
      {
        title: '결과와 해결',
        summary: '문제 상황은 잘 이해했고, 해결 방법을 생각해보는 연습을 함께 해보면 좋겠어요.',
        quote: '"지푸라기 집은 금방 날아가서 큰일이야."',
        notes: ['상황을 정확히 파악했어요', '그럼 첫째가 어떻게 하면 좋았을지 함께 생각해봐요'],
      },
    ],
    highlight: {
      quote: '"셋째 돼지 혼자 벽돌을 쌓느라 정말 힘들었을 것 같아. 형들이 도와주면 좋았을 텐데."',
      reason:
        '인물의 감정을 짐작하고, 관계 회복을 위한 자신의 판단을 자연스럽게 연결해서 말했어요.',
    },
    storyTopics: [
      { question: '셋째 돼지는 벽돌을 쌓는 동안 어떤 기분이었을까?', practice: '감정 표현 연습' },
      { question: '형들은 셋째에게 어떤 말을 해주면 좋을까?', practice: '관점과 공감 연습' },
      {
        question: '삼형제가 처음부터 함께 집을 지었다면 어떤 일이 생겼을까?',
        practice: '결과 예상 연습',
      },
    ],
    dailyTopics: [
      {
        question: '너도 시간이 오래 걸리는 일을 끝까지 해본 적이 있어? 그때 어떤 일이 있었어?',
        practice: '경험 구체화 연습',
      },
      {
        question: '친구가 혼자 힘든 일을 하고 있다면 어떤 기분일까? 어떤 말을 해주고 싶어?',
        practice: '타인 감정 이해 연습',
      },
      {
        question: '느리게 하는 게 더 좋았던 적이 있어? 언제, 어떻게 좋았어?',
        practice: '생각 확장 연습',
      },
    ],
  },
] as const;
