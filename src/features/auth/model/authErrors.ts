import { AuthError } from '@supabase/supabase-js';

import { ApiError } from '@/shared/api';

/**
 * 인증 에러를 화면에 띄울 한 줄로 바꾼다.
 *
 * 이 앱의 에러는 두 갈래에서 온다.
 * - Supabase 인증 서버 → `AuthError` (로그인·가입·비밀번호)
 * - 우리 백엔드 → `ApiError` (인터셉터가 정규화해준다)
 *
 * Supabase 의 원본 메시지는 전부 영어라 그대로 보여줄 수 없다.
 * `error.code` 로 갈라 우리 문구를 준다. **`message` 문자열로 분기하지 않는다** —
 * Supabase 가 문구를 바꾸면 조용히 깨진다. `code` 는 안정적인 식별자다.
 *
 * 어느 갈래에도 안 맞으면 마지막에 일반 문구로 떨어뜨린다. 아이가 아니라
 * 보호자가 보는 화면이라 원인을 알 수 있게는 쓰되, 계정 존재 여부를 알려주는
 * 문구는 피한다(로그인 실패는 이메일/비밀번호를 구분해 말하지 않는다).
 */
const AUTH_MESSAGE: Record<string, string> = {
  invalid_credentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
  email_not_confirmed: '메일함에서 인증 메일을 확인한 뒤 다시 로그인해주세요.',
  email_address_invalid: '이메일 주소 형식을 확인해주세요.',
  email_exists: '이미 가입된 이메일입니다.',
  user_already_exists: '이미 가입된 이메일입니다.',
  user_banned: '사용이 정지된 계정입니다.',
  weak_password: '비밀번호가 너무 단순합니다. 다른 비밀번호를 써주세요.',
  same_password: '이전과 다른 비밀번호를 써주세요.',
  // 틀린 코드와 만료된 코드가 같은 code 로 온다. 둘을 구분해 말할 수 없으니 함께 쓴다.
  otp_expired: '인증코드가 올바르지 않거나 만료됐습니다. 다시 확인해주세요.',
  otp_disabled: '지금은 인증코드로 가입할 수 없습니다.',
  over_request_rate_limit: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',
  over_email_send_rate_limit: '메일 발송이 너무 잦습니다. 잠시 후 다시 시도해주세요.',
  validation_failed: '입력한 내용을 다시 확인해주세요.',
  signup_disabled: '지금은 가입을 받고 있지 않습니다.',
  provider_disabled: '지금은 이 방법으로 로그인할 수 없습니다.',
};

const NETWORK_MESSAGE = '네트워크에 연결할 수 없습니다. 연결 상태를 확인해주세요.';
const DEFAULT_FALLBACK = '처리하지 못했습니다. 잠시 후 다시 시도해주세요.';

/**
 * @param fallback 아는 code 에 걸리지 않았을 때 보여줄 문구.
 *   단계마다 할 일이 다르니("다시 로그인" vs "코드 다시 받기") 호출부가 정한다.
 */
export function authErrorMessage(error: unknown, fallback: string = DEFAULT_FALLBACK): string {
  if (error instanceof AuthError) {
    if (error.code !== undefined && error.code in AUTH_MESSAGE) {
      return AUTH_MESSAGE[error.code];
    }
    // fetch 자체가 실패하면 status 가 비어 온다 (오프라인, DNS, URL 오타).
    // `.env` 의 SUPABASE_URL 이 틀렸을 때도 여기로 떨어진다.
    if (error.status === undefined || error.status === 0) return NETWORK_MESSAGE;
    return fallback;
  }

  // 우리 백엔드 쪽 실패는 인터셉터가 이미 한국어 문구까지 넣어준다.
  if (error instanceof ApiError) return error.message;

  return fallback;
}
