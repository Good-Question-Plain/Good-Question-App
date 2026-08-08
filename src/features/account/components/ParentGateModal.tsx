import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Button, Input, Modal, Text } from '@/shared/ui';

export interface ParentGateModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 보호자 확인 모달 (Figma 141:734).
 *
 * 리포트·계정 설정처럼 보호자만 봐야 하는 화면 앞에 세우는 문이다.
 * 아이가 쓰는 태블릿에 앱이 그대로 열려 있는 상황을 전제로 한 장치라,
 * 취소를 누르거나 배경을 눌러 빠져나갈 수 있어야 한다.
 *
 * 실제 검증은 서버가 한다. 여기서는 입력값을 넘길 뿐 비밀번호를 비교하지 않는다.
 */
export function ParentGateModal({
  visible,
  onConfirm,
  onCancel,
}: ParentGateModalProps): React.JSX.Element {
  const [password, setPassword] = useState('');

  const handleConfirm = (): void => {
    // TODO: 보호자 비밀번호 검증 API
    setPassword('');
    onConfirm();
  };

  const handleCancel = (): void => {
    setPassword('');
    onCancel();
  };

  return (
    <Modal visible={visible} onDismiss={handleCancel} width={420}>
      <View style={styles.header}>
        <View style={styles.mark}>
          <Text variant="heading" color="text">
            ?
          </Text>
        </View>
        <Text variant="captionStrong" align="center">
          잠깐만요!
        </Text>
        <Text variant="footnote" color="textMuted" align="center">
          보호자의 비밀번호를 입력해주세요.
        </Text>
      </View>

      <Input
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />

      <View style={styles.actions}>
        <Button
          label="취소"
          variant="secondary"
          size="lg"
          style={styles.action}
          onPress={handleCancel}
        />
        <Button
          label="확인"
          size="lg"
          style={styles.action}
          disabled={password.length === 0}
          onPress={handleConfirm}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  /**
   * 물음표 원. 디자인 세트에 이 아이콘이 없어 문자 '?' 를 그대로 쓴다
   * (임의로 아이콘을 그리지 않는다). 시안이 나오면 아이콘으로 교체한다.
   */
  mark: {
    width: 48, // 디자인 실측
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  action: {
    flex: 1,
  },
});
