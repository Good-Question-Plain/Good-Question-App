import { useLocalSearchParams } from 'expo-router';

import { useActiveChild } from '@/features/child';
import { StoryDoneScreen, useStories } from '@/features/story';

/** 활동 완료 라우트. 제목은 세션 응답에 없어서 목록(캐시)에서 찾아 넘긴다. */
export default function StoryDoneRoute(): React.JSX.Element {
  const { activeChild } = useActiveChild();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: stories } = useStories('전체');

  return (
    <StoryDoneScreen
      childId={activeChild?.id ?? ''}
      storyTitle={stories?.find((story) => story.id === id)?.title}
    />
  );
}
