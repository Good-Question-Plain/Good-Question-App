export interface WordEntry {
  id: string;
  /** 저장된 단어 */
  word: string;
  /** 어느 이야기에서 나온 단어인지 */
  storyTitle: string;
  /** 어느 아이가 저장했는지 (이름 첫 글자를 뱃지로 보여준다) */
  childName: string;
  saved: boolean;
}

/** 백엔드 API 가 붙기 전까지 화면 확인용으로 쓰는 임시 데이터. */
export const MOCK_WORDS: readonly WordEntry[] = [
  { id: '1', word: '용감한', storyTitle: '아기돼지 삼형제', childName: '지오', saved: true },
  { id: '2', word: '반짝이는', storyTitle: '신데렐라', childName: '지오', saved: true },
  { id: '3', word: '깊은', storyTitle: '곰의 겨울잠', childName: '하윤', saved: true },
  { id: '4', word: '씩씩한', storyTitle: '피터팬', childName: '지오', saved: true },
  { id: '5', word: '신비한', storyTitle: '오즈의 마법사', childName: '규한', saved: true },
  { id: '6', word: '다정한', storyTitle: '너구리의 도토리', childName: '하윤', saved: true },
  { id: '7', word: '눈부신', storyTitle: '신데렐라', childName: '지오', saved: true },
  { id: '8', word: '조용한', storyTitle: '곰의 겨울잠', childName: '규한', saved: false },
] as const;
