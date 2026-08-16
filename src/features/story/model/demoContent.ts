import type { SceneVocabulary, SpeakResult, StepMission } from '../api/progressApi';

/**
 * 서버가 아직 안 채우는 자리를 메우는 **시연용 내용**.
 *
 * ## 왜 있나
 *
 * 백엔드가 이야기의 대화 부분을 아직 못 준다 (인수인계 1-1). 구체적으로
 *
 * - 모든 장면이 `kind: narration` 이라 `speak` 가 400 이다 → **등장인물이 대답을 안 한다**
 * - `vocabularies` 가 전부 빈 배열이다 → **모르는 단어 목록이 안 뜬다**
 * - `mission` 이 전부 null 이다 → **미션 패널이 안 뜬다**
 * - 정답을 맞혀도 `vocabulary` 가 비어 있다 → **핵심 단어 칩이 안 뜬다**
 *
 * 그래서 이야기를 끝까지 해도 **완료 화면 수치가 0, 단어장이 텅 빈** 상태가 된다.
 * 시연에서 그게 그대로 보이지 않도록 앱이 채운다.
 *
 * ## 규칙
 *
 * **서버 값이 있으면 언제나 서버 값이 이긴다.** 여기 있는 건 "서버가 빈 값을 줄 때만"
 * 쓰인다. 백엔드가 채우기 시작하면 이 파일은 저절로 안 쓰이고, 그때 통째로 지우면 된다.
 *
 * 내용은 `방귀 뀌는 며느리` 9장면에 맞춰 썼다. 다른 이야기가 들어오면 장면 수에 맞춰
 * 돌려쓰므로 어긋나 보이지는 않지만, 이야기별로 맞추려면 여기에 표를 늘리면 된다.
 */

/** 장면 번호(1부터)별로 아이가 어려워할 만한 낱말. */
const SCENE_WORDS: Record<
  number,
  readonly { word: string; definition: string; example: string }[]
> = {
  1: [
    {
      word: '며느리',
      definition: '아들의 아내를 이르는 말이에요.',
      example: '며느리가 시집에 왔어요.',
    },
    {
      word: '얌전하다',
      definition: '조용하고 조심스럽게 행동해요.',
      example: '얌전하게 앉아 있었어요.',
    },
  ],
  2: [
    {
      word: '참다',
      definition: '하고 싶은 것을 꾹 누르고 견뎌요.',
      example: '방귀를 꾹 참았어요.',
    },
    {
      word: '부풀다',
      definition: '속이 차서 크게 불러와요.',
      example: '배가 빵빵하게 부풀었어요.',
    },
  ],
  3: [
    {
      word: '고민',
      definition: '어떻게 할지 몰라 마음이 무거운 거예요.',
      example: '며느리는 고민이 깊었어요.',
    },
  ],
  4: [
    {
      word: '기왓장',
      definition: '지붕을 덮는 넓적한 기와 한 장이에요.',
      example: '기왓장이 달그락거렸어요.',
    },
    {
      word: '휘리릭',
      definition: '바람에 빠르게 날아가는 소리예요.',
      example: '먼지가 휘리릭 날아갔어요.',
    },
  ],
  5: [
    {
      word: '창피하다',
      definition: '부끄러워서 얼굴이 화끈거려요.',
      example: '창피해서 고개를 숙였어요.',
    },
  ],
  6: [
    {
      word: '탐스럽다',
      definition: '보기 좋고 갖고 싶을 만큼 먹음직해요.',
      example: '탐스러운 배가 열렸어요.',
    },
  ],
  7: [
    {
      word: '뾰족하다',
      definition: '여기서는 "아주 좋은 방법"이라는 뜻이에요.',
      example: '뾰족한 수가 없을까?',
    },
  ],
  8: [
    {
      word: '후회',
      definition: '지난 일을 뉘우치고 아쉬워하는 마음이에요.',
      example: '시아버지는 후회했어요.',
    },
  ],
  9: [
    {
      word: '특별하다',
      definition: '보통과 달라서 남다른 거예요.',
      example: '나만의 특별한 힘이에요.',
    },
  ],
};

/** 장면별 등장인물의 대답. 아이가 말할 때마다 앞에서부터 하나씩 쓴다. */
const SCENE_REPLIES: Record<number, readonly string[]> = {
  3: [
    '그렇게 생각해줘서 고마워. 그래도 아직은 부끄러운 마음이 더 커.',
    '네 말을 들으니 조금 용기가 나는 것 같아. 한번 솔직하게 말해볼까?',
  ],
  5: [
    '음, 네 말도 일리가 있구나. 그래도 우리 집안 체면이 있지 않느냐!',
    '허허, 그렇게까지 말하니 한번 더 생각해보마.',
  ],
  7: [
    '오, 그런 방법이 있었구나! 그러면 배를 딸 수 있겠는걸?',
    '고맙구나. 자네 덕분에 마을이 배를 먹게 생겼어!',
  ],
  9: ['맞아, 이제는 부끄러워하지 않아도 되겠어. 정말 고마워!'],
};

/** 미션이 붙는 장면. 시안(380:281)의 문구를 그대로 썼다. */
const SCENE_MISSIONS: Record<number, StepMission> = {
  7: {
    condition:
      '높은 배나무의 배를 떨어뜨리기 위해 며느리의 방귀를 안전하게 사용할 수 있는 방법을 찾아볼까?',
    examples: ['무엇을 사용할 것인지'],
  },
};

/** 순서 맞추기를 맞혔을 때 보여줄 핵심 단어. */
const KEY_WORDS: readonly string[] = ['며느리', '참다', '방귀', '배나무', '특별한 힘'];

/** 장면 수가 표보다 많아도 비지 않게 돌려쓴다. */
function pick<T>(table: Record<number, T>, stepIndex: number, sceneCount: number): T | undefined {
  const direct = table[stepIndex];
  if (direct !== undefined) return direct;

  const keys = Object.keys(table).map(Number);
  if (keys.length === 0 || sceneCount <= 0) return undefined;

  return table[keys[stepIndex % keys.length]];
}

/**
 * 이 장면에서 아이가 고를 수 있는 낱말.
 *
 * `selected` 는 화면이 들고 있는 값이라 여기서는 항상 `false` 로 시작한다.
 */
export function demoSceneVocabularies(stepIndex: number, sceneCount: number): SceneVocabulary[] {
  const words = pick(SCENE_WORDS, stepIndex, sceneCount) ?? [];

  return words.map((entry, index) => ({
    id: `demo-${stepIndex}-${index}`,
    word: entry.word,
    definition: entry.definition,
    exampleSentence: entry.example,
    selected: false,
  }));
}

/** 이 장면에 미션이 있으면 준다. */
export function demoMission(stepIndex: number): StepMission | null {
  return SCENE_MISSIONS[stepIndex] ?? null;
}

export const DEMO_KEY_WORDS = KEY_WORDS;

/** 서버가 준 낱말이 없을 때만 쓰는지 판단할 때 쓰는 표식이다. */
export function isDemoVocabularyId(id: string): boolean {
  return id.startsWith('demo-');
}

/**
 * 아이가 말했을 때 등장인물이 뭐라고 답할지.
 *
 * 서버 `speak` 와 같은 모양으로 돌려줘서 화면이 분기를 하나 더 갖지 않아도 된다.
 * 준비된 대답을 다 쓰면 장면이 끝난 것으로 본다.
 */
export function demoSpeakResult(stepIndex: number, turn: number, childText: string): SpeakResult {
  const replies = SCENE_REPLIES[stepIndex] ?? ['그렇구나. 네 이야기를 들려줘서 고마워!'];
  const index = Math.min(turn, replies.length) - 1;
  const ended = turn >= replies.length;

  return {
    accepted: true,
    childText,
    characterLine: replies[Math.max(index, 0)],
    turn,
    maxTurns: replies.length,
    mission: demoMission(stepIndex),
    sceneEnded: ended,
    endReason: ended ? 'goal_met' : null,
  };
}

/**
 * 이야기 상세의 줄거리·역할 안내·등장 인물.
 *
 * 시안에는 있는데 **`GET /stories/{id}` 자체가 명세에 없어** 채울 값이 없다.
 * 그래서 화면에서 통째로 빠져 있었다. 상세 엔드포인트가 생기면 이 표를 지운다.
 */
export interface DemoStoryDetail {
  summary: string;
  role: string;
  characters: readonly string[];
}

const STORY_DETAIL: DemoStoryDetail = {
  summary:
    '방귀를 아주 크게 뀌는 며느리가 있었어요. 부끄러워 꾹 참다가 그만 큰 방귀가 터져 온 집안이 흔들렸지요. 쫓겨날 뻔한 며느리는 아무도 못 따던 높은 배나무의 배를 방귀로 떨어뜨려, 자신의 힘이 남을 도울 수도 있다는 걸 알게 돼요.',
  role: '너는 며느리의 친구가 되어 이야기를 함께 만들어가. 며느리가 고민을 털어놓으면 어떻게 하면 좋을지 네 생각을 들려줘!',
  characters: ['며느리', '시아버지', '마을 이장'],
};

export function demoStoryDetail(): DemoStoryDetail {
  return STORY_DETAIL;
}
