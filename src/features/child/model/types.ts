import type { AvatarId } from '@/shared/ui';

/**
 * 아이 한 명. `GET /users/me/children` 의 원소를 앱 표기로 바꾼 것이다.
 *
 * 서버는 `profile_image_url` 한 칸에 아바타와 사진을 섞어 담는다.
 * 화면이 그 규칙을 알 필요는 없으므로 여기서 둘로 갈라 놓는다 (`avatarRef.ts`).
 */
export interface Child {
  id: string;
  name: string;
  /** 나이(세). **서버가 `birth_year` 로 계산해 내려준다** — 앱에서 다시 계산하지 않는다. */
  age: number;
  /** 서버가 주는 출생연도. 지금 화면에 쓰는 곳은 없지만 나이의 근거라 함께 들고 있다. */
  birthYear: number;
  /** 기본 아바타를 고른 경우. 사진을 올렸으면 null. */
  avatarId: AvatarId | null;
  /** 올린 사진의 URL. 아바타를 골랐으면 null. */
  photoUrl: string | null;
}

/** 아바타·사진 중 아무것도 없을 때 쓸 기본값. 화면이 빈 칸을 그리지 않게 한다. */
export const FALLBACK_AVATAR_ID: AvatarId = 'bear';
