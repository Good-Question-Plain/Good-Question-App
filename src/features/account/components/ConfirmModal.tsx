import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Button, Modal, Text, WarningIcon } from '@/shared/ui';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  description?: string;
  /** 제목 위에 뜨는 원형 아이콘. 파괴적 동작이면 빨강, 아니면 주황. */
  tone?: 'default' | 'danger';
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 확인 버튼 위에 들어갈 추가 내용(삭제 항목 목록 등). */
  children?: ReactNode;
}

/**
 * 예/아니오를 묻는 확인 모달.
 *
 * 로그아웃·회원탈퇴처럼 PRD 가 "2차 확인"을 요구하는 자리에 쓴다.
 * 파괴적 동작일 때는 배경 탭으로 닫히지 않는다 — 실수로 눌러 닫는 것보다
 * 명시적으로 취소를 고르게 하는 편이 안전하다.
 */
export function ConfirmModal({
  visible,
  title,
  description,
  tone = 'default',
  confirmLabel,
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps): React.JSX.Element {
  const isDanger = tone === 'danger';

  return (
    <Modal
      visible={visible}
      onDismiss={onCancel}
      onRequestClose={onCancel}
      dismissOnBackdropPress={!isDanger}
      width={480}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, isDanger ? styles.iconDanger : styles.iconDefault]}>
          <WarningIcon width={28} height={28} />
        </View>
        <Text variant="heading" align="center">
          {title}
        </Text>
        {description !== undefined && (
          <Text variant="caption" color="textStrong">
            {description}
          </Text>
        )}
      </View>

      {children}

      <View style={styles.actions}>
        <Button
          label={cancelLabel}
          variant="secondary"
          size="lg"
          style={styles.action}
          onPress={onCancel}
        />
        <Button
          label={confirmLabel}
          variant={isDanger ? 'danger' : 'primary'}
          size="lg"
          style={styles.action}
          onPress={onConfirm}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 64, // 디자인 실측
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
  },
  iconDefault: {
    backgroundColor: colors.primary,
  },
  iconDanger: {
    backgroundColor: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  action: {
    flex: 1,
  },
});
