import { type User } from '@supabase/supabase-js';

import { toApiError } from '@/shared/api';

import { profileNameFromUser } from '../model/profileName';

import { syncProfile } from './authApi';

/**
 * 서버 DB 에 보호자 프로필이 있는 상태를 보장한다.
 *
 * Supabase 계정과 우리 서버의 `parents` 행은 별개다. **이 행이 없으면 `PARENT`
 * 권한이 필요한 나머지 API 가 전부 401 로 막힌다** (백엔드 확인: 실제로
 * `/users/me/children` 이 그래서 401 이었고, sync-profile 한 번이면 풀린다).
 *
 * 두 자리에서 부른다.
 * - **회원가입**: 비밀번호 설정 직후 (정상 경로 — 여기서 행이 만들어진다)
 * - **로그인**: 보정용. 앱의 가입 흐름을 타지 않은 계정(콘솔에서 직접 만든 것,
 *   가입 도중 실패한 것)도 여기서 붙는다
 *
 * **Bearer 토큰이 필요하다.** 반드시 세션이 생긴 뒤에 불러야 한다.
 *
 * ## 실패해도 세션을 되돌리지 않는다
 *
 * 예전에는 401/403 이면 `signOut()` 까지 했다. 그래서 백엔드 설정 문제 하나로
 * **비밀번호가 맞는데도 아무도 로그인할 수 없는** 상태가 됐다
 * (Supabase `token` 200 → 우리 서버 401 → 앱이 `logout`). 기기에서 재현했다.
 *
 * 프로필 행 만들기는 **부수적인 일**이지 인증의 전제가 아니다. 실패는 호출부가
 * 판단하게 던지기만 하고, 세션은 건드리지 않는다.
 */
export async function ensureServerProfile(user: User): Promise<void> {
  try {
    await syncProfile(profileNameFromUser(user));
  } catch (error) {
    const apiError = toApiError(error);

    // 409 — 이미 등록된 계정. 두 번째 로그인부터는 항상 여기로 온다. 정상이다.
    if (apiError.kind === 'conflict') return;

    throw apiError;
  }
}

/**
 * 로그인 경로용 — **실패해도 로그인을 막지 않는다.**
 *
 * 서버 프로필이 없으면 뒤따르는 화면들이 401 로 막히므로 로그인할 때도 한 번
 * 불러준다. 다만 이게 실패한다고 로그인을 되돌리면 위 주석의 사고가 다시 난다.
 *
 * **`await` 하는 이유**: 이걸 기다리지 않으면 아이 목록 요청이 프로필보다 먼저
 * 나가서 401 을 받는다.
 */
export async function tryEnsureServerProfile(user: User): Promise<void> {
  try {
    await ensureServerProfile(user);
  } catch (error) {
    if (__DEV__) {
      console.warn(`[auth] sync-profile 실패 — 로그인은 계속한다. ${toApiError(error).message}`);
    }
  }
}
