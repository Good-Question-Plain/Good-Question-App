import { useState } from 'react';

import { MOCK_CHILDREN } from '@/features/child';
import { ReportScreen } from '@/features/report';

/**
 * 보호자 리포트 라우트.
 *
 * 홈과 같은 이유로 "지금 보고 있는 아이"를 여기서 들고 전환 목록을 넘긴다
 * (report 는 child 를 모른다).
 *
 * TODO: 전역 상태가 붙으면 활성 아이를 useState 대신 스토어에서 읽는다.
 * 마이페이지에서 들어올 때마다 첫 아이로 초기화된다.
 */
export default function ReportRoute(): React.JSX.Element {
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0]?.id ?? '');

  const activeChild = MOCK_CHILDREN.find((child) => child.id === activeChildId);

  return (
    <ReportScreen
      childName={activeChild?.name ?? '아이'}
      childOptions={MOCK_CHILDREN}
      onSelectChild={setActiveChildId}
    />
  );
}
