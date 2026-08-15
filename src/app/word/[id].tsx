import { useActiveChild } from '@/features/child';
import { WordDetailScreen } from '@/features/wordbook';

/**
 * 단어 상세 라우트.
 *
 * 단어장 목록과 같은 이유로 활성 아이를 여기서 넘긴다
 * (`GET /vocabulary/{id}` 가 `child_id` 를 필수로 받는다).
 */
export default function WordDetailRoute(): React.JSX.Element {
  const { activeChild } = useActiveChild();

  return <WordDetailScreen childId={activeChild?.id ?? ''} />;
}
