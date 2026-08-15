import { request } from '@/shared/api';
import type { AvatarId } from '@/shared/ui';

import { avatarToProfileImage, parseProfileImage } from '../model/avatarRef';
import type { Child } from '../model/types';

import { uploadProfileImage } from './profileImageApi';

/**
 * 자녀 프로필 API.
 *
 * 경로에 `/api` 를 붙이지 않는다 — 명세 상세 페이지가 틀렸다는 걸 배포 서버에서
 * 확인했다. 근거는 `features/auth/api/authApi.ts` 주석에 있다.
 */

/** 서버가 그대로 내려주는 모양. 앱 안에서는 이 타입을 쓰지 않는다. */
interface ChildDto {
  id: string;
  name: string;
  profile_image_url: string | null;
  birth_year: number;
  age: number;
}

function toChild(dto: ChildDto): Child {
  const { avatarId, photoUrl } = parseProfileImage(dto.profile_image_url);
  return {
    id: dto.id,
    name: dto.name,
    age: dto.age,
    birthYear: dto.birth_year,
    avatarId,
    photoUrl,
  };
}

/** `GET /users/me/children` */
export async function fetchChildren(): Promise<Child[]> {
  const dtos = await request<ChildDto[]>({ url: '/users/me/children' });
  return dtos.map(toChild);
}

export interface CreateChildInput {
  name: string;
  avatarId: AvatarId;
  /**
   * 아바타 대신 올린 사진. 있으면 저장소에 먼저 올리고 그 키를 쓴다.
   * 없으면 `avatarId` 를 표식으로 넣는다 (`avatarRef.ts`).
   */
  photo?: { uri: string; contentType: string };
}

/**
 * `POST /users/me/children` — 201 로 만들어진 아이를 돌려준다.
 *
 * **명세에 출생연도를 보낼 자리가 없다.** body 는 `{ name, profile_image_url }`
 * 뿐인데 응답에는 `birth_year` 와 `age` 가 들어 있다. 지금 화면도 생년을 받지
 * 않으므로(디자인에 칸이 없다) 그대로 두지만, 나이가 어디서 오는지는
 * **백엔드에 확인이 필요하다.**
 */
export async function createChild({ name, avatarId, photo }: CreateChildInput): Promise<Child> {
  // 사진을 골랐으면 저장소에 먼저 올린다. 여기서 실패하면 아이를 만들지 않는다 —
  // 아바타로 만들어 두면 사용자는 사진이 올라간 줄 알고 넘어간다.
  const profileImageUrl =
    photo === undefined
      ? avatarToProfileImage(avatarId)
      : (await uploadProfileImage({ ...photo, target: 'child' })).objectKey;

  const dto = await request<ChildDto>({
    method: 'POST',
    url: '/users/me/children',
    data: { name: name.trim(), profile_image_url: profileImageUrl },
  });
  return toChild(dto);
}

export interface UpdateChildInput {
  childId: string;
  name?: string;
  avatarId?: AvatarId;
}

/** `PATCH /users/me/children/{child_id}` */
export async function updateChild({ childId, name, avatarId }: UpdateChildInput): Promise<Child> {
  const dto = await request<ChildDto>({
    method: 'PATCH',
    url: `/users/me/children/${childId}`,
    data: {
      ...(name === undefined ? {} : { name: name.trim() }),
      ...(avatarId === undefined ? {} : { profile_image_url: avatarToProfileImage(avatarId) }),
    },
  });
  return toChild(dto);
}
