import { useLocalSearchParams, useRouter } from 'expo-router';

import { useActiveChild } from '@/features/child';
import { ReportScreen } from '@/features/report';

/**
 * 보호자 리포트 라우트.
 *
 * 리포트는 **이야기 한 편당 하나**라 어느 이야기의 리포트인지가 필요하다.
 * 마이페이지에서 들어올 때는 `story` 없이 오므로, 그때는 진행 중인 이야기의
 * 리포트를 먼저 보여준다.
 *
 * 이전/다음 리포트로 옮길 때도 라우트 파라미터만 바꾼다 — 화면이 스스로
 * 상태를 들고 있지 않아야 뒤로가기와 딥링크가 자연스럽다.
 */
export default function ReportRoute(): React.JSX.Element {
  const router = useRouter();
  const { activeChild, children, selectChild } = useActiveChild();
  const { story } = useLocalSearchParams<{ story?: string }>();

  return (
    <ReportScreen
      childName={activeChild?.name ?? '아이'}
      childId={activeChild?.id ?? ''}
      childPhotoUrl={activeChild?.photoUrl}
      childOptions={children}
      onSelectChild={selectChild}
      storyId={story ?? ''}
      onSelectStory={(storyId) => router.setParams({ story: storyId })}
    />
  );
}
