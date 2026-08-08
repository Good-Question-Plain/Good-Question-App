import { MypageScreen } from '@/features/account';
import { MOCK_CHILDREN } from '@/features/child';

/**
 * 마이페이지 라우트.
 *
 * account 와 child 는 서로를 모르므로, 둘을 아는 유일한 지점인 라우트에서
 * 아이 목록을 넘겨 조립한다. 실제 API 가 붙으면 이 자리가 조회 훅으로 바뀐다.
 */
export default function MypageRoute(): React.JSX.Element {
  return (
    <MypageScreen
      parentName="김보호"
      parentEmail="parent@email.com"
      childProfiles={MOCK_CHILDREN}
    />
  );
}
