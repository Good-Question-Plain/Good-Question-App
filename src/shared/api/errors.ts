import { isAxiosError } from 'axios';

/**
 * 앱 전체에서 쓰는 단일 에러 타입.
 *
 * axios 에러, 서버 에러 응답, 네트워크 단절이 각각 다른 모양으로 흘러다니면
 * 화면마다 분기가 늘어난다. 인터셉터에서 전부 이 타입으로 정규화한다.
 */
/**
 * 종류는 API 명세가 실제로 쓰는 상태코드에 맞춰 나눴다.
 * 401 과 403 을 합치지 않은 이유는 화면에서 해야 할 일이 다르기 때문이다 —
 * 401 은 다시 로그인시켜야 하고, 403 은 로그인은 됐지만 남의 자원을 본 것이다.
 */
export type ApiErrorKind =
  /** 서버에 닿지 못함 (오프라인, DNS, 타임아웃) */
  | 'network'
  /** 401. 토큰이 없거나 만료됐거나, 서버에 프로필이 아직 등록되지 않았다 */
  | 'unauthorized'
  /** 403. 로그인은 됐지만 이 자원에 대한 권한이 없다 */
  | 'forbidden'
  /** 404. 대상이 없다 */
  | 'notFound'
  /** 409. 이미 있는 것을 또 만들려 했다 (예: 프로필 중복 등록) */
  | 'conflict'
  /** 그 밖의 4xx */
  | 'client'
  /** 서버 잘못 (5xx) */
  | 'server'
  /** 그 외 */
  | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  /** 서버가 내려준 원본 body. 세부 검증 메시지를 꺼낼 때 쓴다. */
  readonly payload?: unknown;

  constructor(kind: ApiErrorKind, message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.payload = payload;
  }
}

const DEFAULT_MESSAGE: Record<ApiErrorKind, string> = {
  network: '네트워크에 연결할 수 없습니다. 연결 상태를 확인해주세요.',
  unauthorized: '로그인이 필요합니다.',
  forbidden: '접근 권한이 없습니다.',
  notFound: '찾을 수 없습니다.',
  conflict: '이미 처리된 요청입니다.',
  client: '요청을 처리할 수 없습니다.',
  server: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  unknown: '알 수 없는 오류가 발생했습니다.',
};

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  if (status >= 500) return 'server';
  if (status >= 400) return 'client';
  return 'unknown';
}

/** 서버가 `{ message: string }` 형태로 에러를 내려준다는 가정. 스펙이 정해지면 여기만 고친다. */
function messageFromPayload(payload: unknown): string | undefined {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const { message } = payload as { message: unknown };
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return undefined;
}

/** 어떤 형태의 예외든 `ApiError` 로 변환한다. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (status === undefined) {
      return new ApiError('network', DEFAULT_MESSAGE.network);
    }

    const kind = kindFromStatus(status);
    const payload = error.response?.data;
    return new ApiError(
      kind,
      messageFromPayload(payload) ?? DEFAULT_MESSAGE[kind],
      status,
      payload,
    );
  }

  return new ApiError('unknown', error instanceof Error ? error.message : DEFAULT_MESSAGE.unknown);
}
