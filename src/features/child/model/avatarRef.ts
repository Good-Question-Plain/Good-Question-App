import { AVATARS, type AvatarId } from '@/shared/ui';

/**
 * 아바타 선택을 서버의 `profile_image_url` 한 칸에 실어 보내는 규칙.
 *
 * **디자인과 서버가 어긋나는 자리다.** 디자인(92:808)은 아이가 기본 아바타 8종
 * 중 하나를 고르게 하는데, 서버 스키마에는 이미지 URL 칸 하나뿐이고 아바타를
 * 가리키는 필드가 없다. 아바타 그림은 앱에 번들된 SVG 라 올릴 URL 자체가 없다.
 *
 * 그래서 `avatar:bear` 같은 표식을 URL 칸에 넣는다. 읽을 때 접두사로 갈라서
 * 아바타면 번들 그림을, 아니면 올린 사진을 그린다.
 *
 * **백엔드에 `avatar_id` 필드를 요청하는 게 맞다.** 그때가 되면 이 파일과
 * `toChild()` 의 두 줄만 고치면 된다 — 화면은 이미 `avatarId` 로만 본다.
 */
const AVATAR_PREFIX = 'avatar:';

export function avatarToProfileImage(avatarId: AvatarId): string {
  return `${AVATAR_PREFIX}${avatarId}`;
}

export interface ProfileImageRef {
  /** 기본 아바타를 고른 경우. 사진을 올렸으면 null. */
  avatarId: AvatarId | null;
  /** 올린 사진의 URL. 아바타를 골랐으면 null. */
  photoUrl: string | null;
}

/**
 * 서버가 준 `profile_image_url` 을 아바타와 사진 중 하나로 가른다.
 *
 * **사진으로 인정하는 건 `http`/`https` 로 시작할 때뿐이다.** 업로드 API 는
 * `object_key`(예: `profiles/ab12.jpg`)를 돌려주는데, 그걸 그대로 저장해도
 * 되는지 명세에 없다. 만약 키가 그대로 저장된다면 `<Image>` 가 못 읽어
 * **원이 통째로 빈 칸이 된다** — 그럴 바엔 기본 아바타를 그리는 쪽이 낫다.
 * 서버가 공개 URL 로 바꿔주면 이 함수는 손댈 필요 없이 바로 사진이 뜬다.
 */
export function parseProfileImage(raw: string | null | undefined): ProfileImageRef {
  if (raw === null || raw === undefined || raw.length === 0) {
    return { avatarId: null, photoUrl: null };
  }

  if (raw.startsWith(AVATAR_PREFIX)) {
    const id = raw.slice(AVATAR_PREFIX.length);
    // 앱이 모르는 아바타 id 가 저장돼 있을 수 있다(앱 업데이트로 목록이 바뀐 경우).
    // 그때는 사진도 아바타도 아닌 상태로 두고 화면이 기본값을 쓰게 한다.
    const known = AVATARS.some((avatar) => avatar.id === id);
    return { avatarId: known ? (id as AvatarId) : null, photoUrl: null };
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return { avatarId: null, photoUrl: raw };
  }

  return { avatarId: null, photoUrl: null };
}
