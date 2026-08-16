import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuthSession } from '../hooks/useAuthSession';

export interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * 로그인하지 않은 사용자가 앱 안쪽 화면에 들어오지 못하게 막는다.
 *
 * 지금까지는 딥링크(`goodquestion://report` 등)로 아무 화면이나 열렸다.
 * 개발 중에는 편했지만 실제로는 남의 아이 리포트로 곧장 들어갈 수 있다는 뜻이다.
 *
 * 규칙은 두 줄뿐이다.
 * 1. 세션이 없는데 보호 화면에 있으면 → 로그인으로 되돌린다 (항상)
 * 2. 세션이 있는데 로그인 화면에 있으면 → 건너뛴다 (**앱을 켠 직후 한 번만**)
 *
 * 2번을 한 번만 하는 게 중요하다. 매번 걸면 로그인 도중에 세션이 잠깐 생겼다
 * 사라지는 경우(서버가 토큰을 거부해 `ensureServerProfile` 이 되돌리는 경우)에
 * 화면이 튀었다 돌아오면서 **에러 문구가 사라진다.** 그러면 사용자는 왜 안 되는지
 * 알 수 없다. 로그인 성공 뒤 이동은 `LoginScreen` 이 직접 한다.
 */
export function AuthGate({ children }: AuthGateProps): React.JSX.Element | null {
  const { session, isLoading, isResolved } = useAuthSession();
  const segments = useSegments();
  const router = useRouter();
  const didResolveInitial = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    // 로그인 화면(`src/app/index.tsx`)은 segment 가 없어서 undefined 로 온다.
    // expo-router 의 타입은 실제 라우트만 열거하므로 undefined 를 직접 붙여준다.
    const first: string | undefined = segments[0];

    // **`isResolved` 로 막는 게 중요하다.** `isLoading` 만 보면, 세션 확인이
    // 3초 타임아웃으로 넘어간 순간(아직 세션을 모르는 상태)에 이 판정이
    // 소모돼 버린다. 그러면 뒤늦게 세션이 도착해도 안쪽으로 보내주지 않아서
    // **로그인돼 있는데 로그인 화면에 갇힌다.**
    if (!didResolveInitial.current && isResolved) {
      didResolveInitial.current = true;
      // 이미 로그인돼 있는데 로그인 화면으로 시작했다 → 바로 안쪽으로 보낸다.
      if (session !== null && first === undefined) {
        router.replace('/child/select');
        return;
      }
    }

    if (session === null && !isPublicRoute(first)) {
      router.replace('/');
    }
  }, [session, isLoading, isResolved, segments, router]);

  // 세션을 읽는 동안에는 아무것도 그리지 않는다. 여기서 children 을 그리면
  // 로그인된 사용자에게 로그인 화면이 한 프레임 보인다.
  if (isLoading) return null;

  return <>{children}</>;
}

/**
 * 로그인 없이 열 수 있는 화면 (첫 segment 기준).
 *
 * `dev` 는 컴포넌트 갤러리라 로그인과 무관하게 열려 있어야 한다 —
 * 프로덕션 빌드에서 이 라우트를 빼는 건 별개 문제다.
 */
const PUBLIC_ROUTES = new Set(['signup', 'find-password', 'dev', '_sitemap', '+not-found']);

/** segment 가 없는 경우(= 로그인 화면)도 공개다. */
function isPublicRoute(firstSegment: string | undefined): boolean {
  return firstSegment === undefined || PUBLIC_ROUTES.has(firstSegment);
}
