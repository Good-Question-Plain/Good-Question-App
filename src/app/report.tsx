import { useLocalSearchParams, useRouter } from 'expo-router';

import { useActiveChild } from '@/features/child';
import { ReportScreen } from '@/features/report';
import { useLastStoryStore } from '@/features/story';

/**
 * 보호자 리포트 라우트.
 *
 * 리포트는 **이야기 한 편당 하나**라 어느 이야기의 리포트인지가 필요하다.
 * 마이페이지에서 들어올 때는 `story` 없이 오므로, **마지막으로 연 이야기**로
 * 떨어진다. 그게 없으면 화면이 "어느 이야기인지 고르라"고 안내한다.
 *
 * 서버에 리포트 목록 API 가 없어서 "가장 최근에 끝낸 이야기"를 물어볼 데가 없다
 * (`features/story/model/lastStoryStore` 에 이유를 적어뒀다).
 *
 * 이전/다음 리포트로 옮길 때도 라우트 파라미터만 바꾼다 — 화면이 스스로
 * 상태를 들고 있지 않아야 뒤로가기와 딥링크가 자연스럽다.
 */
export default function ReportRoute(): React.JSX.Element {
  const router = useRouter();
  const { activeChild, children, selectChild } = useActiveChild();
  const { story } = useLocalSearchParams<{ story?: string }>();
  const lastStoryId = useLastStoryStore((state) => state.lastStoryId);

  return (
    <ReportScreen
      childName={activeChild?.name ?? '아이'}
      childId={activeChild?.id ?? ''}
      childPhotoUrl={activeChild?.photoUrl}
      childOptions={children}
      onSelectChild={selectChild}
      storyId={story ?? lastStoryId ?? ''}
      onSelectStory={(storyId) => router.setParams({ story: storyId })}
    />
  );
}
