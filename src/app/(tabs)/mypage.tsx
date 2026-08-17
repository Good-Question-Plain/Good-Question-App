import { MypageScreen, useParentProfile } from '@/features/account';
import { useChildren } from '@/features/child';

/**
 * 마이페이지 라우트.
 *
 * account 와 child 는 서로를 모르므로, 둘을 아는 유일한 지점인 라우트에서
 * 보호자 정보(`GET /users/me`)와 아이 목록(`GET /users/me/children`)을 합친다.
 */
export default function MypageRoute(): React.JSX.Element {
  const { data: parent } = useParentProfile();
  const { data: children } = useChildren();

  return (
    <MypageScreen
      // 받아오는 동안에는 빈 문자열로 둔다. 자리표시 이름을 넣으면 남의 이름이
      // 잠깐 보이는 것처럼 읽힌다.
      parentName={parent?.name ?? ''}
      parentEmail={parent?.email ?? ''}
      childProfiles={children ?? []}
    />
  );
}
