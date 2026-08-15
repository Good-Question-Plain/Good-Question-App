import { useActiveChild } from '@/features/child';
import { ReportScreen } from '@/features/report';

/**
 * 보호자 리포트 라우트.
 *
 * 홈과 같은 이유로 "지금 보고 있는 아이"를 여기서 들고 전환 목록을 넘긴다
 * (report 는 child 를 모른다).
 *
 * 홈과 같은 스토어를 보므로 **홈에서 고른 아이가 그대로 이어진다.**
 */
export default function ReportRoute(): React.JSX.Element {
  const { activeChild, children, selectChild } = useActiveChild();

  return (
    <ReportScreen
      childName={activeChild?.name ?? '아이'}
      childOptions={children}
      onSelectChild={selectChild}
    />
  );
}
