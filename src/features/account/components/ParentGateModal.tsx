import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { toApiError } from '@/shared/api';
import { colors, radius, spacing } from '@/shared/theme';
import { Button, Input, Modal, Text } from '@/shared/ui';

import { useVerifyParentPassword } from '../api/queries';

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
 * **검증은 서버가 한다** (`POST /auth/verify-password`). 여기서 비밀번호를
 * 비교하지 않는다 — 앱이 아는 값으로 막으면 아이가 앱을 뜯어볼 수 있는 만큼
 * 문이 아니게 된다.
 */
export function ParentGateModal({
  visible,
  onConfirm,
  onCancel,
}: ParentGateModalProps): React.JSX.Element {
  const [password, setPassword] = useState('');
  const verify = useVerifyParentPassword();

  const errorMessage = verify.isError ? gateErrorMessage(verify.error) : undefined;

  const handleConfirm = (): void => {
    if (password.length === 0 || verify.isPending) return;

    verify.mutate(password, {
      onSuccess: () => {
        setPassword('');
        onConfirm();
      },
    });
  };

  const handleCancel = (): void => {
    setPassword('');
    verify.reset();
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
        onChangeText={(next) => {
          setPassword(next);
          if (verify.isError) verify.reset();
        }}
        status={errorMessage === undefined ? 'default' : 'error'}
        helperText={errorMessage}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        editable={!verify.isPending}
        onSubmitEditing={handleConfirm}
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
          loading={verify.isPending}
          onPress={handleConfirm}
        />
      </View>
    </Modal>
  );
}

/**
 * 서버는 비밀번호 불일치와 토큰 문제를 **둘 다 401** 로 준다.
 *
 * 이 모달은 로그인된 상태에서만 열리므로 실질적으로 전자다. 그래서 401 은
 * "비밀번호가 달라요"로 안내한다 — 여기서 "로그인이 필요합니다"가 뜨면
 * 보호자는 무엇을 해야 할지 알 수 없다.
 */
function gateErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.kind === 'unauthorized') return '비밀번호가 올바르지 않아요.';
  if (apiError.kind === 'network') return apiError.message;
  return '확인하지 못했어요. 잠시 후 다시 시도해주세요.';
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
