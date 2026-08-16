import { useLocalSearchParams } from 'expo-router';

import { useActiveChild } from '@/features/child';
import { StoryPlayScreen, useStories } from '@/features/story';

/**
 * 이야기 대화 라우트.
 *
 * 세션 응답에는 이야기 제목이 없어서 목록에서 찾아 넘긴다. 목록은 이 화면에
 * 들어오기 전에 이미 받아둔 캐시라 대개 추가 요청이 없다.
 */
export default function StoryPlayRoute(): React.JSX.Element {
  const { activeChild } = useActiveChild();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: stories } = useStories('전체');

  return (
    <StoryPlayScreen
      childId={activeChild?.id ?? ''}
      storyTitle={stories?.find((story) => story.id === id)?.title}
    />
  );
}
