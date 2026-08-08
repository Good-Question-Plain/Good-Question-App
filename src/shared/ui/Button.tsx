import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, hitSize, radius, spacing } from '@/shared/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  /** 눌린 동안 스피너를 보여주고 입력을 막는다. */
  loading?: boolean;
  /** 가로를 꽉 채운다. 태블릿에서는 기본값(false)이 대체로 낫다. */
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled === true || loading;
  const palette = variantPalette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && !isDisabled && { backgroundColor: palette.backgroundPressed },
        isDisabled && { backgroundColor: palette.backgroundDisabled, borderColor: 'transparent' },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      {/* 스피너가 떠도 버튼 폭이 흔들리지 않도록 라벨은 자리를 유지한 채 투명하게 둔다. */}
      <Text
        variant={size === 'md' ? 'button' : 'buttonSmall'}
        color={isDisabled ? palette.labelDisabled : palette.label}
        style={loading && styles.hidden}
      >
        {label}
      </Text>
      {loading && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ActivityIndicator style={styles.spinner} color={colors[palette.label]} />
        </View>
      )}
    </Pressable>
  );
}

/**
 * 변형별 색.
 *
 * primary 의 비활성 색이 회색이 아니라 primary/300(#FFC266)인 건 디자인을 따른 것이다.
 * 로그인 화면의 "계속하기" 버튼이 입력 전 상태에서 이 색으로 그려져 있다.
 */
const variantPalette = {
  primary: {
    background: colors.primary,
    backgroundPressed: colors.primaryPressed,
    backgroundDisabled: colors.primaryMuted,
    border: 'transparent',
    label: 'textInverse',
    labelDisabled: 'textInverse',
  },
  secondary: {
    background: colors.surface,
    backgroundPressed: colors.surfaceMuted,
    backgroundDisabled: colors.disabled,
    border: colors.borderStrong,
    label: 'text',
    labelDisabled: 'disabledText',
  },
  ghost: {
    background: 'transparent',
    backgroundPressed: colors.surfaceMuted,
    backgroundDisabled: 'transparent',
    border: 'transparent',
    label: 'primary',
    labelDisabled: 'disabledText',
  },
  danger: {
    background: colors.danger,
    backgroundPressed: colors.dangerPressed,
    backgroundDisabled: colors.disabled,
    border: 'transparent',
    label: 'textInverse',
    labelDisabled: 'disabledText',
  },
} as const satisfies Record<
  Variant,
  {
    background: string;
    backgroundPressed: string;
    backgroundDisabled: string;
    border: string;
    label: ColorTokenName;
    labelDisabled: ColorTokenName;
  }
>;

type ColorTokenName = keyof typeof colors;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  hidden: {
    opacity: 0,
  },
  spinner: {
    flex: 1,
  },
});

const sizeStyles = StyleSheet.create({
  // 디자인 실측: 기본 버튼 h=45, 모달 하단 버튼 h=48.
  // hitSize.min(48) 보다 작은 45 는 태블릿에서도 폭이 넓어 터치에 문제없다.
  md: {
    minHeight: 45,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  lg: {
    minHeight: hitSize.min,
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
  },
});
