import { type User } from '@supabase/supabase-js';

/**
 * `POST /api/auth/sync-profile` 에 보낼 보호자 이름을 정한다.
 *
 * **디자인의 회원가입에 이름 입력칸이 없다.** 4단계가 이메일 → 인증코드 →
 * 비밀번호 → 완료라서, 가입 시점에 이름을 받을 자리가 없다. 그런데 명세는
 * `{ name }` 을 필수로 요구하고 `GET /api/users/me` 도 이름을 돌려준다.
 *
 * 그래서 있는 것 중에서 가장 사람 이름에 가까운 값을 고른다.
 * 1. 소셜 로그인이 채워주는 `user_metadata` (Google 은 `full_name`, 카카오·네이버는 `name`)
 * 2. 없으면 이메일의 @ 앞부분
 *
 * 이메일 가입이면 사실상 2번이 된다. 마이페이지에 이름 수정이 붙으면
 * `PATCH /api/users/me` 로 바꾸게 하는 게 맞다.
 * **디자이너·백엔드 확인 대상**: 가입 단계에 이름칸을 넣을지, 아니면 이대로 둘지.
 */
export function profileNameFromUser(user: User): string {
  const metadata: Record<string, unknown> = user.user_metadata ?? {};

  for (const key of ['name', 'full_name', 'nickname', 'preferred_username']) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  const local = (user.email ?? '').split('@')[0]?.trim();
  // 이메일조차 없는 경우(전화 가입 등)는 지금 흐름에 없지만, 빈 문자열을 보내면
  // 서버 검증에서 막히므로 마지막 방어선을 둔다.
  return local && local.length > 0 ? local : '보호자';
}
