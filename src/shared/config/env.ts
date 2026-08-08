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

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

if (__DEV__ && !apiBaseUrl) {
  console.warn(
    '[env] EXPO_PUBLIC_API_BASE_URL 이 비어 있습니다. ' +
      '.env.example 을 복사해 .env 를 만들고 값을 채운 뒤 `npx expo start --clear` 로 재시작하세요.',
  );
}

export const env = {
  apiBaseUrl,
  isDev: __DEV__,
} as const;
