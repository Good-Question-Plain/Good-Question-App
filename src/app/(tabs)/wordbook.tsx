import { useActiveChild } from '@/features/child';
import { useDemoSessionStore } from '@/features/story';
import { WordbookScreen } from '@/features/wordbook';

/**
 * 단어장 라우트.
 *
 * 단어장은 아이별이라 `child_id` 가 필수인데, wordbook 은 child 를 모른다.
 * 둘을 아는 유일한 지점인 여기서 활성 아이를 넘긴다.
 */
export default function WordbookRoute(): React.JSX.Element {
  const { activeChild } = useActiveChild();
  const demo = useDemoSessionStore();

  return (
    <WordbookScreen
      childId={activeChild?.id ?? ''}
      childName={activeChild?.name ?? ''}
      // 서버가 아이 발화를 못 받아 단어장이 늘 비어 있다(인수인계 1-1). 이야기에서
      // 고른 낱말을 앱이 기억해뒀다가 그때만 대신 보여준다. wordbook 은 story 를
      // 모르므로 둘을 아는 유일한 지점인 여기서 넘긴다.
      fallbackWords={demo.words.map((word) => ({
        id: word.id,
        word: word.word,
        storyId: demo.storyId ?? '',
        storyTitle: demo.storyTitle,
        saved: true,
        kind: 'curious' as const,
      }))}
    />
  );
}
