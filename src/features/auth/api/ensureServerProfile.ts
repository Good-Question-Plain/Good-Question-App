import { type User } from '@supabase/supabase-js';

import { supabase, toApiError } from '@/shared/api';

import { profileNameFromUser } from '../model/profileName';

import { syncProfile } from './authApi';

/**
 * 서버 DB 에 보호자 프로필이 있는 상태를 보장한다.
 *
 * Supabase 계정과 우리 서버의 프로필은 별개다. 이걸 건너뛰면 `PARENT` 권한이
 * 필요한 나머지 API 가 전부 401 "프로필이 등록되지 않은 사용자입니다" 로 막힌다.
 *
 * 두 자리에서 부른다. 어느 쪽이 먼저 닿든 결과가 같아야 해서 한 함수로 뒀다.
 * - 회원가입: 인증코드 확인 뒤 세션이 생긴 시점 (정상 경로)
 * - 로그인: 가입 때 ②가 실패했거나 콘솔에서 직접 만든 계정을 위한 보정
 *
 * **Bearer 토큰이 필요하다.** 반드시 세션이 생긴 뒤에 불러야 한다
 * (`signUp()` 직후에는 Confirm email 때문에 세션이 없다).
 */
export async function ensureServerProfile(user: User): Promise<void> {
  try {
    await syncProfile(profileNameFromUser(user));
  } catch (error) {
    const apiError = toApiError(error);

    // 409 — 이미 등록된 계정. 두 번째 로그인부터는 항상 여기로 온다. 정상이다.
    if (apiError.kind === 'conflict') return;

    // 백엔드가 아직 이 엔드포인트를 구현하지 않았다(명세의 BE 진행상황이 비어 있다).
    // 서버에 못 닿는 것 때문에 Supabase 인증까지 되돌리면 지금은 아무도 로그인할 수
    // 없다. 서버 탓인 실패는 넘기고 인증은 성립시킨다.
    // **BE 가 붙으면 이 분기를 지우고 실패로 취급해야 한다.**
    if (apiError.kind === 'network' || apiError.kind === 'notFound' || apiError.kind === 'server') {
      if (__DEV__) {
        console.warn(
          `[auth] sync-profile 실패(${apiError.kind}) — 서버 미구현으로 보고 진행한다. ` +
            apiError.message,
        );
      }
      return;
    }

    // 401/403 은 토큰 자체가 거부된 것이다. 이 상태로 두면 "로그인은 됐는데 아무
    // 화면도 안 열리는" 상태가 되므로 Supabase 세션까지 되돌려 상태를 맞춘다.
    await supabase.auth.signOut();
    throw apiError;
  }
}
