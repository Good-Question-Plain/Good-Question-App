export interface WordEntry {
  id: string;
  /** 저장된 단어 */
  word: string;
  /** 어느 이야기에서 나온 단어인지 */
  storyTitle: string;
  /** 어느 아이가 저장했는지 (이름 첫 글자를 뱃지로 보여준다) */
  childName: string;
  saved: boolean;

  // --- 상세 화면에서만 쓰는 값들 ---
  /** 이 단어는 이런 뜻이에요 */
  meaning: string;
  /** 언제 쓰는 말이에요? */
  usage: string;
  /** 이야기에서는 이렇게 나왔어요 */
  quote: string;
}

/**
 * 백엔드 API 가 붙기 전까지 화면 확인용으로 쓰는 임시 데이터.
 *
 * 설명 문구는 아이에게 직접 말하듯 반말로 쓴다 (디자인 118:174 의 톤).
 */
export const MOCK_WORDS: readonly WordEntry[] = [
  {
    id: '1',
    word: '용감한',
    storyTitle: '아기돼지 삼형제',
    childName: '지오',
    saved: true,
    meaning: '무섭거나 힘든 상황에서도 씩씩하게 행동하는 걸 말해.',
    usage: "친구가 무서워할 때 앞장서서 도와주거나, 어려운 일에 도전할 때 '용감하다'고 말해.",
    quote: '셋째 돼지는 용감한 마음으로 늑대에게 맞섰어요.',
  },
  {
    id: '2',
    word: '반짝이는',
    storyTitle: '신데렐라',
    childName: '지오',
    saved: true,
    meaning: '빛이 반사되어 작게 빛나는 모습을 말해.',
    usage: '밤하늘의 별이나 유리 구두처럼 빛나는 것을 볼 때 써.',
    quote: '반짝이는 유리 구두가 계단에 남아 있었어요.',
  },
  {
    id: '3',
    word: '깊은',
    storyTitle: '곰의 겨울잠',
    childName: '하윤',
    saved: true,
    meaning: '바닥에서 아주 멀리 들어간 상태를 말해.',
    usage: "물이나 잠처럼 끝이 멀게 느껴질 때 '깊다'고 해.",
    quote: '곰은 깊은 잠에 빠져 봄을 기다렸어요.',
  },
  {
    id: '4',
    word: '씩씩한',
    storyTitle: '피터팬',
    childName: '지오',
    saved: true,
    meaning: '기운차고 굳센 모습을 말해.',
    usage: "힘든 일에도 기운을 잃지 않을 때 '씩씩하다'고 해.",
    quote: '피터팬은 씩씩한 목소리로 친구들을 불렀어요.',
  },
  {
    id: '5',
    word: '신비한',
    storyTitle: '오즈의 마법사',
    childName: '규한',
    saved: true,
    meaning: '무슨 일인지 알기 어려워 신기한 느낌을 말해.',
    usage: '설명하기 어려운 신기한 일을 만났을 때 써.',
    quote: '신비한 초록 빛이 오즈의 성을 감쌌어요.',
  },
  {
    id: '6',
    word: '다정한',
    storyTitle: '너구리의 도토리',
    childName: '하윤',
    saved: true,
    meaning: '마음이 따뜻하고 상냥한 걸 말해.',
    usage: "친구를 살뜰히 챙겨줄 때 '다정하다'고 해.",
    quote: '너구리는 다정한 목소리로 친구를 불렀어요.',
  },
  {
    id: '7',
    word: '눈부신',
    storyTitle: '신데렐라',
    childName: '지오',
    saved: true,
    meaning: '빛이 너무 밝아 바라보기 어려운 걸 말해.',
    usage: '햇빛이나 아주 예쁜 것을 보았을 때 써.',
    quote: '눈부신 드레스가 무도회장을 밝혔어요.',
  },
  {
    id: '8',
    word: '조용한',
    storyTitle: '곰의 겨울잠',
    childName: '규한',
    saved: false,
    meaning: '소리가 거의 나지 않는 상태를 말해.',
    usage: "도서관처럼 소리를 낮춰야 할 때 '조용하다'고 해.",
    quote: '조용한 숲속에 눈이 소복이 쌓였어요.',
  },
] as const;

export function findWord(id: string): WordEntry | undefined {
  return MOCK_WORDS.find((entry) => entry.id === id);
}

/** 이야기별로 묶은 단어 목록. 단어장의 '이야기별' 탭에서 쓴다. */
export interface WordGroup {
  storyTitle: string;
  words: readonly WordEntry[];
}

export function groupByStory(entries: readonly WordEntry[]): WordGroup[] {
  const map = new Map<string, WordEntry[]>();
  for (const entry of entries) {
    const bucket = map.get(entry.storyTitle);
    if (bucket) bucket.push(entry);
    else map.set(entry.storyTitle, [entry]);
  }
  return [...map.entries()].map(([storyTitle, words]) => ({ storyTitle, words }));
}
