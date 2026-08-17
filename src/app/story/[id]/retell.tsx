import { useActiveChild } from '@/features/child';
import { StoryRetellScreen } from '@/features/story';

/** 이야기 후 활동 라우트. 활동은 아이별 세션에 매달려 있어 활성 아이를 넘긴다. */
export default function StoryRetellRoute(): React.JSX.Element {
  const { activeChild } = useActiveChild();

  return <StoryRetellScreen childId={activeChild?.id ?? ''} />;
}
