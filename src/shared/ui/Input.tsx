import { forwardRef, useCallback, useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
  type TextInput as TextInputRef,
} from 'react-native';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { colors, motion, radius, spacing, typography } from '@/shared/theme';

import { Appear } from './Appear';
import { CheckCircleIcon } from './icons';
import { Text } from './Text';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export type InputStatus = 'default' | 'error' | 'success';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** 인풋 위에 붙는 라벨. 없으면 라벨 줄 자체가 빠진다. */
  label?: string;
  /**
   * 인풋 아래 안내 문구. 검증 상태에 따라 색이 바뀐다.
   * `status` 가 'error' 면 빨강, 'success' 면 초록, 기본은 회색이다.
   */
  helperText?: string;
  status?: InputStatus;
  containerStyle?: ViewStyle;
}

/**
 * 라벨 + 입력창 + 안내문구를 한 덩어리로 묶은 폼 필드.
 *
 * 높이 45 / radius 12 는 자동레이아웃으로 제대로 짜인 로그인 화면(10:1100)의
 * 실측값이다. 모달 시안들은 48/10 으로 그려져 있지만 절대좌표로 찍은 미완성
 * 시안이라 기준으로 삼지 않았다.
 *
 * 포커스가 들어오면 테두리가 주황으로 부드럽게 바뀐다. 아이가 "지금 여기에
 * 쓰는 중"을 알아채기 쉽도록 색 대비를 준 것이고, 검증 상태(빨강/초록)가 있으면
 * 그쪽이 우선이라 포커스 색으로 덮지 않는다.
 */
export const Input = forwardRef<TextInputRef, InputProps>(function Input(
  { label, helperText, status = 'default', containerStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    (event) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
    (event) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const accentColor =
    status === 'error' ? colors.danger : status === 'success' ? colors.success : colors.primary;
  const isAccented = focused || status !== 'default';

  // 0(기본 테두리) → 1(강조 테두리). 색 보간은 네이티브 드라이버를 쓸 수 없다.
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const target = isAccented ? 1 : 0;
    if (reduceMotion) {
      progress.setValue(target);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: target,
      duration: motion.duration.base,
      easing: motion.easing.out,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [isAccented, progress, reduceMotion]);

  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, accentColor],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label !== undefined && <Text variant="label">{label}</Text>}

      <AnimatedTextInput
        ref={ref}
        style={[styles.input, { borderColor }]}
        placeholderTextColor={colors.textPlaceholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />

      {helperText !== undefined && (
        // status 가 바뀌면 key 가 바뀌어 문구가 다시 부드럽게 들어온다.
        <Appear key={status} style={styles.helperRow}>
          {status === 'success' && <CheckCircleIcon width={14} height={14} />}
          <Text variant="footnote" color={helperColor[status]}>
            {helperText}
          </Text>
        </Appear>
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
    height: 45, // 디자인 실측
    paddingHorizontal: 17, // 디자인 실측값 (4의 배수 스케일을 벗어남)
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
