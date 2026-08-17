import { useActiveChild } from '@/features/child';
import { HomeScreen } from '@/features/story';

/**
 * 홈 라우트.
 *
 * story 는 child 를 모른다. 둘을 아는 유일한 지점인 여기서 "지금 쓰는 아이"를
 * 들고 전환 목록을 넘긴다.
 *
 * 선택은 이제 전역(`useActiveChild`)이라 홈을 벗어나도 유지되고, 리포트로도
 * 이어진다. 아이 목록은 `GET /users/me/children` 에서 온다.
 */
export default function HomeRoute(): React.JSX.Element {
  const { activeChild, children, selectChild } = useActiveChild();

  return (
    <HomeScreen
      // 목록을 받아오는 동안에도 화면은 그려진다. 이름 자리가 빈 채로 보이면
      // 어색해서 디자인에 없는 임시 호칭을 쓴다 (아이가 읽는 화면이다).
      childName={activeChild?.name ?? '친구'}
      childId={activeChild?.id ?? ''}
      childPhotoUrl={activeChild?.photoUrl}
      childOptions={children}
      onSelectChild={selectChild}
    />
  );
}
