/**
 * 서버가 준 이미지 값 중 **`<Image>` 가 실제로 받아올 수 있는 것만** 통과시킨다.
 *
 * 서버가 같은 필드를 두 가지 모양으로 준다 (2026-08-17 실기기 확인).
 *
 * ```
 * https://<버킷>.s3.amazonaws.com/scenes/…png?X-Amz-Signature=…   받을 수 있다
 * scenes/banggui/scene_01.png                                     객체 키 — 못 받는다
 * ```
 *
 * 스킴이 없는 값을 `source={{ uri }}` 에 넣으면 **React Native 는 에러도 없이
 * 아무것도 그리지 않는다.** 화면에는 빈 칸만 남고 로그에도 안 찍혀서, 서버가 값을
 * 안 준 것인지 앱이 못 그린 것인지 구분되지 않는다 (실제로 장면 배경이 통째로
 * 빈 칸이 됐는데 원인을 찾는 데 오래 걸렸다).
 *
 * 그래서 여기서 `null` 로 떨어뜨린다. 그러면 화면이 준비해둔 대체 그림이 나온다 —
 * **빈 칸보다 낫고, 무엇보다 "그림이 없다"가 화면 하나로 일관되게 표현된다.**
 *
 * 아이 프로필 사진에는 같은 규칙이 이미 있었다(`child/model/avatarRef.ts`).
 * 그때 겪은 문제가 장면·썸네일·활동 카드에서 그대로 되풀이돼 한 곳으로 모았다.
 *
 * **서버가 전부 presigned URL 로 통일하면 이 함수는 그대로 통과시킨다** —
 * 지울 필요가 없다.
 */
export function toRemoteImageUri(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;

  const value = raw.trim();
  if (value.length === 0) return null;

  return value.startsWith('http://') || value.startsWith('https://') ? value : null;
}
