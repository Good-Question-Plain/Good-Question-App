import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import {
  AvatarOption,
  Button,
  findAvatar,
  Modal,
  PlusIcon,
  Text,
  type AvatarId,
} from '@/shared/ui';

/**
 * 이 모달이 아이에 대해 알아야 하는 최소한.
 *
 * `@/features/child` 의 `Child` 를 직접 가져오지 않는다 — feature 끼리 의존하면
 * 순환 참조가 생기고 한쪽을 고칠 때 다른 쪽이 딸려온다. 구조가 같으니 호출부에서
 * `Child[]` 를 그대로 넘길 수 있다.
 */
export interface ChildProfileSummary {
  id: string;
  name: string;
  avatarId: AvatarId;
}

export interface ChildProfileModalProps {
  visible: boolean;
  profiles: readonly ChildProfileSummary[];
  /** 현재 사용 중인 아이 */
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

/**
 * 아이 프로필 전환 모달 (Figma 86:734).
 *
 * 마이페이지에서 "지금 쓰는 아이"를 바꾼다. 보호자 한 계정에 아이가 여러 명일 수
 * 있어서(PRD 5.1) 매번 로그아웃하지 않고 여기서 갈아탈 수 있어야 한다.
 */
export function ChildProfileModal({
  visible,
  profiles,
  activeId,
  onSelect,
  onAdd,
  onClose,
}: ChildProfileModalProps): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(activeId);

  const handleConfirm = (): void => {
    if (selectedId !== null) onSelect(selectedId);
    onClose();
  };

  return (
    <Modal visible={visible} onDismiss={onClose} width={560}>
      <View style={styles.header}>
        <Text variant="heading" align="center">
          아이를 선택해주세요
        </Text>
        <Text variant="caption" color="textMuted" align="center">
          선택한 아이로 이야기를 이어가요
        </Text>
      </View>

      <View style={styles.row}>
        {profiles.map((profile, index) => (
          <AvatarOption
            key={profile.id}
            label={profile.name}
            Icon={findAvatar(profile.avatarId).Icon}
            tintIndex={index}
            size={88}
            selected={profile.id === selectedId}
            onPress={() => setSelectedId(profile.id)}
          />
        ))}
        <AvatarOption label="추가하기" Icon={PlusIcon} dashed size={88} onPress={onAdd} />
      </View>

      <Button
        label="선택 완료"
        fullWidth
        size="lg"
        disabled={selectedId === null}
        onPress={handleConfirm}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
});
