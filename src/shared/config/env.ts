/**
 * 환경 변수 접근 지점.
 *
 * Expo 는 `EXPO_PUBLIC_` 접두사가 붙은 값만 번들에 주입한다.
 * `process.env.EXPO_PUBLIC_X` 는 빌드 타임에 문자열로 치환되므로
 * 반드시 리터럴로 접근해야 한다 (동적 키 접근은 치환되지 않는다).
 *
 * 여기서 즉시 throw 하지 않는 이유: 앱 부팅 시점에 터지면 화면 자체가 안 뜬다.
 * 값이 없으면 경고만 남기고, 실제로 그 값이 필요한 시점(= API 호출)에 실패시킨다.
 */

/** 끝 슬래시가 있으면 `baseURL + '/path'` 가 `//path` 가 되어 404 가 난다. */
function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

const apiBaseUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL ?? '');
const supabaseUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_SUPABASE_URL ?? '');
/** Supabase 의 공개(anon) 키. 클라이언트에 넣으라고 만들어진 값이라 번들에 들어가도 된다. */
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Supabase URL 은 **프로젝트 루트**여야 한다 (`https://xxxx.supabase.co`).
 *
 * 콘솔에서 Data API 쪽 주소(`.../rest/v1`)를 복사해 넣는 실수가 잦은데, 그러면
 * 로그인 요청이 auth 서버가 아니라 PostgREST 로 가서 `PGRST125` 로 실패한다.
 * 조용히 깨지면 원인을 찾기 어려우니 개발 중에는 바로 알려준다.
 */
if (__DEV__ && supabaseUrl && new URL(supabaseUrl).pathname !== '/') {
  console.warn(
    '[env] EXPO_PUBLIC_SUPABASE_URL 에 경로가 붙어 있습니다. ' +
      '콘솔의 Project Settings → API → Project URL 값(https://<프로젝트>.supabase.co)만 넣으세요.',
  );
}

if (__DEV__) {
  const missing = [
    ['EXPO_PUBLIC_API_BASE_URL', apiBaseUrl],
    ['EXPO_PUBLIC_SUPABASE_URL', supabaseUrl],
    ['EXPO_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(
      `[env] ${missing.join(', ')} 이(가) 비어 있습니다. ` +
        '.env.example 을 복사해 .env 를 만들고 값을 채운 뒤 `npx expo start --clear` 로 재시작하세요.',
    );
  }
}

export const env = {
  apiBaseUrl,
  supabaseUrl,
  supabaseAnonKey,
  isDev: __DEV__,
} as const;
