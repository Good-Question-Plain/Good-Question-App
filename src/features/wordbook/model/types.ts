/** 단어장 목록의 한 칸. `GET /vocabulary` 의 원소다. */
export interface WordEntry {
  id: string;
  /** 저장된 단어 */
  word: string;
  storyId: string;
  /** 어느 이야기에서 나온 단어인지. 서버가 안 주면 빈 문자열이다. */
  storyTitle: string;
  saved: boolean;
  /** `used` = 이야기에서 쓴 말, `curious` = 뜻을 물어본 말. 안 줄 수도 있다. */
  kind?: 'used' | 'curious';
}

/**
 * 단어 상세. 목록에 없는 설명들이 붙는다 (`GET /vocabulary/{id}`).
 *
 * 설명 문구는 아이에게 직접 말하듯 반말로 온다 (디자인 118:174 의 톤).
 * 서버가 만들어 내려주는 값이라 앱에서 다듬지 않는다.
 */
export interface WordDetail extends WordEntry {
  /** 이 단어는 이런 뜻이에요 */
  meaning: string;
  /** 언제 쓰는 말이에요? */
  usage: string;
  /** 이야기에서는 이렇게 나왔어요 */
  quote: string;
  /** 발음 듣기용. 아직 화면에 재생 버튼이 없어 쓰이지 않는다. */
  audioUrl: string | null;
}

export interface WordGroup {
  storyTitle: string;
  words: WordEntry[];
}

/** '이야기별' 필터. 서버가 묶어주지 않으므로 받은 목록을 화면에서 묶는다. */
export function groupByStory(entries: readonly WordEntry[]): WordGroup[] {
  const map = new Map<string, WordEntry[]>();
  for (const entry of entries) {
    const bucket = map.get(entry.storyTitle);
    if (bucket) bucket.push(entry);
    else map.set(entry.storyTitle, [entry]);
  }
  return [...map.entries()].map(([storyTitle, words]) => ({ storyTitle, words }));
}
