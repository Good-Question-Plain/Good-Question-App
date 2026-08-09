import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ChildProfileModal } from '@/features/account';
import { MOCK_CHILDREN } from '@/features/child';
import { HomeScreen } from '@/features/story';

/**
 * 홈 라우트.
 *
 * story · child · account 는 서로를 모른다. 셋을 아는 유일한 지점인 여기서
 * "지금 쓰는 아이"를 들고 전환 모달을 붙인다.
 *
 * TODO: 인증/전역 상태가 붙으면 활성 아이를 여기 useState 대신 스토어에서 읽는다.
 * 지금은 홈을 벗어나면 선택이 초기화된다.
 */
export default function HomeRoute(): React.JSX.Element {
  const router = useRouter();
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0]?.id ?? '');
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const activeChild = MOCK_CHILDREN.find((child) => child.id === activeChildId);

  return (
    <>
      <HomeScreen
        childName={activeChild?.name ?? '친구'}
        onSwitchChild={() => setSwitcherOpen(true)}
      />

      <ChildProfileModal
        visible={switcherOpen}
        profiles={MOCK_CHILDREN}
        activeId={activeChildId}
        onSelect={setActiveChildId}
        onAdd={() => {
          setSwitcherOpen(false);
          router.push('/child/create');
        }}
        onClose={() => setSwitcherOpen(false)}
      />
    </>
  );
}
