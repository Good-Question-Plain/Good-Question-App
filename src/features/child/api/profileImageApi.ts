import { request } from '@/shared/api';

/**
 * 프로필 사진 업로드.
 *
 * 파일을 우리 서버로 보내지 않는다. 서버는 **업로드할 주소만 발급**하고
 * 실제 파일은 앱이 그 주소(S3 등)로 직접 올린다.
 *
 * ```
 * ① POST /users/profile-image/presigned-url  → { upload_url, object_key }
 * ② PUT  <upload_url>  (파일 본문)           → 저장소에 직접 업로드
 * ③ object_key 를 자녀의 profile_image_url 로 저장
 * ```
 *
 * **②만 `apiClient` 를 쓰지 않는다.** 우리 서버가 아니라 저장소로 가는 요청이라
 * baseURL 이 붙으면 안 되고, 무엇보다 인터셉터가 `Authorization` 을 실으면
 * S3 가 "서명과 Authorization 을 같이 보낼 수 없다"며 거부한다.
 * 그래서 이 한 번만 `fetch` 를 직접 쓴다 (AGENTS 의 axios 금지 규칙은 우리 API 얘기다).
 */

/** 업로드 대상. 명세에 값 목록이 없어 화면에서 쓰는 두 가지만 정의했다 — **백엔드 확인 필요.** */
export type ProfileImageTarget = 'child' | 'parent';

interface PresignedUrlDto {
  upload_url: string;
  object_key: string;
}

export interface UploadedImage {
  /**
   * 저장소에 올라간 객체의 키.
   *
   * **이 값을 그대로 `profile_image_url` 에 넣어도 되는지 명세에 없다.**
   * 공개 URL 을 따로 만들어야 할 수도 있다 — 백엔드 확인 대상이다.
   */
  objectKey: string;
}

export interface UploadProfileImageInput {
  /** 선택한 이미지의 로컬 uri (`ImagePickerAsset.uri`). */
  uri: string;
  /** `image/jpeg` 같은 MIME 타입. 서버가 이미지가 아니면 400 을 준다. */
  contentType: string;
  target: ProfileImageTarget;
}

export async function uploadProfileImage({
  uri,
  contentType,
  target,
}: UploadProfileImageInput): Promise<UploadedImage> {
  const { upload_url: uploadUrl, object_key: objectKey } = await request<PresignedUrlDto>({
    method: 'POST',
    url: '/users/profile-image/presigned-url',
    data: { content_type: contentType, target },
  });
  // 로컬 파일을 읽어 그대로 올린다. RN 의 fetch 는 file:// uri 를 Blob 으로
  // 읽을 수 있어서 파일 시스템 모듈을 따로 넣지 않아도 된다.
  const raw = await (await fetch(uri)).blob();

  /**
   * **Blob 의 `type` 을 반드시 맞춰야 한다.**
   *
   * React Native 는 Blob 을 body 로 보낼 때 **그 Blob 의 `type` 으로
   * `Content-Type` 헤더를 덮어쓴다.** `fetch(uri).blob()` 로 읽은 파일은 type 이
   * 비어 있어서, 아래에서 헤더를 직접 줘도 실제로는 **빈 Content-Type** 이 나간다.
   *
   * presigned URL 은 `content-type` 을 서명에 포함해서 만들어지므로
   * (`X-Amz-SignedHeaders=content-type;host`), 값이 다르면 S3 가
   * **403 `SignatureDoesNotMatch`** 로 거부한다. 기기에서 S3 응답의
   * `CanonicalRequest` 에 `content-type:` 이 빈 줄로 찍히는 걸 확인했다.
   */
  const body = raw.type === contentType ? raw : new Blob([raw], { type: contentType });

  const uploaded = await fetch(uploadUrl, {
    method: 'PUT',
    // 서명할 때 정한 Content-Type 과 정확히 같아야 통과한다.
    headers: { 'Content-Type': contentType },
    body,
  });

  if (!uploaded.ok) {
    // 저장소가 주는 본문은 XML 이라 그대로 보여줄 수 없다. 상태코드만 남긴다.
    throw new Error(`프로필 사진 업로드 실패 (${uploaded.status})`);
  }

  return { objectKey };
}
