import { request } from '@/shared/api';

/**
 * 보호자 계정 API.
 *
 * 경로에 `/api` 를 붙이지 않는다 (근거는 `features/auth/api/authApi.ts` 주석).
 *
 * **`GET /users/mypage` 를 쓰지 않는다.** 그건 보호자와 아이 목록을 한 번에
 * 내려주는 편의 엔드포인트인데, 그러면 아이 목록이 `/users/me/children` 과
 * 두 군데서 오게 된다. 아이를 추가했을 때 두 캐시를 다 무효화해야 하고
 * (child ↔ account feature 가 서로를 알아야 한다) 한쪽만 갱신되면 화면마다
 * 다른 목록이 보인다. 요청 한 번을 아끼는 것보다 **출처를 하나로 두는 쪽**을
 * 택했다. 태블릿 앱이라 요청 두 번이 문제 되지 않는다.
 */

interface ParentDto {
  id: string;
  name: string;
  email: string;
  profile_image_url: string | null;
}

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
}

/** `GET /users/me` */
export async function fetchParentProfile(): Promise<ParentProfile> {
  const dto = await request<ParentDto>({ url: '/users/me' });
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    photoUrl: dto.profile_image_url === '' ? null : dto.profile_image_url,
  };
}

/**
 * `POST /auth/verify-password` — 보호자 확인 모달이 쓴다.
 *
 * **비밀번호를 앱에서 비교하지 않는다.** 서버가 토큰의 email 클레임으로 계정을
 * 찾아 대조한다. 틀리면 401 "비밀번호가 올바르지 않습니다" 다 — 토큰 만료와
 * 같은 401 이라 화면에서 문구로 구분할 수 없다. 호출부는 이 모달 안에서만
 * "비밀번호가 다르다"로 안내한다(로그인 상태로만 열 수 있는 모달이라
 * 토큰 문제일 가능성이 낮다).
 */
export async function verifyParentPassword(password: string): Promise<void> {
  await request<{ message: string }>({
    method: 'POST',
    url: '/auth/verify-password',
    data: { password },
  });
}

/**
 * `DELETE /auth/me` — 회원탈퇴.
 *
 * **서버가 Supabase 계정까지 지운다** (실패하면 400 "Supabase 계정 삭제에
 * 실패했습니다"). 그래서 앱에서 `supabase.auth.admin` 을 부를 일이 없고,
 * 부를 수도 없다 — service role 키는 클라이언트에 넣지 않는다.
 *
 * 성공한 뒤에는 로컬 세션도 지워야 한다. 서버 계정이 사라졌는데 세션만 남으면
 * 앱은 로그인된 것처럼 보이면서 모든 요청이 401 로 떨어진다.
 */
export async function withdrawAccount(): Promise<void> {
  await request<{ message: string }>({ method: 'DELETE', url: '/auth/me' });
}

export interface UpdateParentInput {
  name: string;
}

/** `PATCH /users/me` */
export async function updateParentProfile({ name }: UpdateParentInput): Promise<ParentProfile> {
  const dto = await request<ParentDto>({
    method: 'PATCH',
    url: '/users/me',
    data: { name: name.trim() },
  });
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    photoUrl: dto.profile_image_url === '' ? null : dto.profile_image_url,
  };
}
