import { useState } from 'react';

import { MOCK_CHILDREN } from '@/features/child';
import { HomeScreen } from '@/features/story';

/**
 * 홈 라우트.
 *
 * story 는 child 를 모른다. 둘을 아는 유일한 지점인 여기서 "지금 쓰는 아이"를
 * 들고 전환 목록을 넘긴다.
 *
 * TODO: 인증/전역 상태가 붙으면 활성 아이를 여기 useState 대신 스토어에서 읽는다.
 * 지금은 홈을 벗어나면 선택이 초기화된다.
 */
export default function HomeRoute(): React.JSX.Element {
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0]?.id ?? '');

  const activeChild = MOCK_CHILDREN.find((child) => child.id === activeChildId);

  return (
    <HomeScreen
      childName={activeChild?.name ?? '친구'}
      childOptions={MOCK_CHILDREN}
      onSelectChild={setActiveChildId}
    />
  );
}
