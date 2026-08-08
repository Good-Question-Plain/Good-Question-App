import type { AvatarId } from '@/shared/ui';

export interface Child {
  id: string;
  name: string;
  avatarId: AvatarId;
}

/**
 * 백엔드 API 가 붙기 전까지 화면 확인용으로 쓰는 임시 데이터.
 * 실제 목록이 연결되면 이 파일만 지우면 된다.
 */
export const MOCK_CHILDREN: readonly Child[] = [
  { id: '1', name: '지오', avatarId: 'bear' },
  { id: '2', name: '하윤', avatarId: 'rabbit' },
  { id: '3', name: '규한', avatarId: 'fox' },
] as const;
