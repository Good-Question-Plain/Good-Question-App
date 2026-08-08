import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
  type TextInput as TextInputRef,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme';

import { CheckCircleIcon } from './icons';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** 인풋 위에 붙는 라벨. 없으면 라벨 줄 자체가 빠진다. */
  label?: string;
  /**
   * 인풋 아래 안내 문구. 검증 상태에 따라 색이 바뀐다.
   * `status` 가 'error' 면 빨강, 'success' 면 초록, 기본은 회색이다.
   */
  helperText?: string;
  status?: 'default' | 'error' | 'success';
  containerStyle?: ViewStyle;
}

/**
 * 라벨 + 입력창 + 안내문구를 한 덩어리로 묶은 폼 필드.
 *
 * 디자인상 로그인 화면은 h45/radius12, 모달은 h48/radius10 인데 시각적으로
 * 거의 차이가 없어 h48/radius12 로 통일했다. (모달 쪽이 자동레이아웃 없이
 * 절대좌표로 그려진 미완성 시안이라 그쪽에 맞추지 않았다.)
 */
export const Input = forwardRef<TextInputRef, InputProps>(function Input(
  { label, helperText, status = 'default', containerStyle, ...rest },
  ref,
) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label !== undefined && <Text variant="label">{label}</Text>}

      <TextInput
        ref={ref}
        style={[styles.input, statusStyles[status]]}
        placeholderTextColor={colors.textPlaceholder}
        {...rest}
      />

      {helperText !== undefined && (
        <View style={styles.helperRow}>
          {status === 'success' && <CheckCircleIcon width={14} height={14} />}
          <Text variant="footnote" color={helperColor[status]}>
            {helperText}
          </Text>
        </View>
      )}
    </View>
  );
});

const helperColor = {
  default: 'textMuted',
  error: 'danger',
  success: 'success',
} as const;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    height: 48,
    paddingHorizontal: 17, // 디자인 실측값 (4의 배수 스케일을 벗어남)
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

const statusStyles = StyleSheet.create({
  default: { borderColor: colors.border },
  error: { borderColor: colors.danger },
  success: { borderColor: colors.success },
});
