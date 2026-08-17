import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { ConfirmModal } from './ConfirmModal';

export interface WithdrawModalProps {
  visible: boolean;
  /** 탈퇴 요청을 기다리는 중. 되돌릴 수 없는 동작이라 그동안 버튼을 막는다. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 탈퇴 시 삭제되는 항목. 디자인(86:773)에 적힌 순서 그대로다. */
const DELETED_ITEMS = ['아이 학습 기록', '저장한 단어장', '학습 리포트', '계정 정보'] as const;

/**
 * 회원탈퇴 확인 모달 (Figma 86:773).
 *
 * 무엇이 사라지는지 먼저 보여준다. 되돌릴 수 없는 동작에서 목록을 생략하면
 * 사용자가 무엇을 잃는지 모르고 누르게 된다.
 */
export function WithdrawModal({
  visible,
  loading = false,
  onConfirm,
  onCancel,
}: WithdrawModalProps): React.JSX.Element {
  return (
    <ConfirmModal
      visible={visible}
      tone="danger"
      title="정말 탈퇴하시겠어요?"
      description="탈퇴하면 아래 정보가 삭제돼요"
      confirmLabel="탈퇴하기"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <View style={styles.list}>
        {DELETED_ITEMS.map((item) => (
          <View key={item} style={styles.item}>
            <View style={styles.bullet} />
            <Text variant="caption">{item}</Text>
          </View>
        ))}
      </View>

      <Text variant="footnote" color="danger">
        30일 이내에는 재로그인 시 복구 가능해요
      </Text>
    </ConfirmModal>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  bullet: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textSubtle,
  },
});
