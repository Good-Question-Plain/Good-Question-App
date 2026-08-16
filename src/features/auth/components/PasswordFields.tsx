import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Input } from '@/shared/ui';

export interface PasswordFieldsProps {
  password: string;
  onPasswordChange: (value: string) => void;
  confirm: string;
  onConfirmChange: (value: string) => void;
  /**
   * 두 칸의 안내 문구.
   *
   * 회원가입은 "비밀번호", 비밀번호 재설정은 **"새 비밀번호"** 로 시안이 다르다
   * (86:708). 나머지는 같아서 문구만 바꿔 쓴다.
   */
  newLabel?: boolean;
}

/** PRD 기준: 8자 이상, 영문+숫자 조합. */
export function isValidPassword(value: string): boolean {
  return value.length >= 8 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value);
}

/**
 * 비밀번호 + 확인 두 칸.
 *
 * 회원가입 3단계와 비밀번호 재설정 3단계가 완전히 같은 UI 라 하나로 뽑았다.
 * 확인란은 뭔가 입력하기 전까지는 조용히 두고, 입력이 시작된 뒤에만
 * 일치/불일치를 알려준다 — 타이핑 도중에 빨간 문구가 먼저 뜨면 실수한 기분이 든다.
 */
export function PasswordFields({
  password,
  onPasswordChange,
  confirm,
  onConfirmChange,
  newLabel = false,
}: PasswordFieldsProps): React.JSX.Element {
  const confirmTouched = confirm.length > 0;
  const matches = confirmTouched && password === confirm;
  const prefix = newLabel ? '새 ' : '';

  return (
    <View style={styles.container}>
      <Input
        placeholder={`${prefix}비밀번호`}
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        helperText="8자 이상, 영문+숫자 조합"
        status={password.length > 0 && !isValidPassword(password) ? 'error' : 'default'}
      />
      <Input
        placeholder={`${prefix}비밀번호 확인`}
        value={confirm}
        onChangeText={onConfirmChange}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        status={confirmTouched ? (matches ? 'success' : 'error') : 'default'}
        helperText={
          confirmTouched ? (matches ? '비밀번호가 일치해요' : '비밀번호가 달라요') : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
});
