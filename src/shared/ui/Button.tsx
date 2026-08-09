import { useState } from 'react';
import {
  ActivityIndicator,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, hitSize, radius, spacing, type TypographyVariant } from '@/shared/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'xl';

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
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps): React.JSX.Element {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled === true || loading;
  const palette = variantPalette[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
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
        variant={labelVariant[size]}
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
    </PressableScale>
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

/** 크기가 커질수록 라벨도 커진다. `lg` 가 `md` 보다 작은 건 디자인이 그렇다(모달 하단 버튼). */
const labelVariant = {
  md: 'button',
  lg: 'buttonSmall',
  xl: 'buttonLarge',
} as const satisfies Record<Size, TypographyVariant>;

const sizeStyles = StyleSheet.create({
  // 디자인 실측: 로그인 화면의 기본 버튼 h=45, 모달 하단 버튼 h=48, 홈 "이어하기" h=49.
  // 45 는 터치 권장치(48)보다 살짝 낮지만 버튼 폭이 넓어 실사용에 문제없다.
  md: {
    height: 45,
    paddingHorizontal: spacing.xl,
  },
  lg: {
    height: hitSize.min,
    paddingHorizontal: spacing['3xl'],
  },
  xl: {
    height: 49,
    paddingHorizontal: spacing['3xl'],
  },
});
