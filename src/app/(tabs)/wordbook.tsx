import { useActiveChild } from '@/features/child';
import { WordbookScreen } from '@/features/wordbook';

/**
 * 단어장 라우트.
 *
 * 단어장은 아이별이라 `child_id` 가 필수인데, wordbook 은 child 를 모른다.
 * 둘을 아는 유일한 지점인 여기서 활성 아이를 넘긴다.
 */
export default function WordbookRoute(): React.JSX.Element {
  const { activeChild } = useActiveChild();

  return <WordbookScreen childId={activeChild?.id ?? ''} childName={activeChild?.name ?? ''} />;
}
