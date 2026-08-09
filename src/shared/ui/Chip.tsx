import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, hitSlopFor, radius, spacing, type TypographyVariant } from '@/shared/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  /** 누를 수 없는 표시용 칩(이야기 카드의 태그 등)일 때는 비워둔다. */
  onPress?: () => void;
  /**
   * `md` 가 기본(카테고리 필터), `sm` 은 카드 안 작은 태그,
   * `lg` 는 홈 추천 카드처럼 글자가 큰 태그다.
   */
  size?: 'md' | 'sm' | 'lg';
  style?: ViewStyle;
}

/**
 * 알약형 칩. 카테고리 필터와 이야기 태그에 쓴다.
 *
 * 선택 상태는 주황 배경 + 흰 글씨, 기본은 옅은 주황 배경 + 진한 주황 글씨.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  size = 'md',
  style,
}: ChipProps): React.JSX.Element {
  const content = (
    <Text variant={labelVariant[size]} color={selected ? 'textInverse' : 'primaryTextDeep'}>
      {label}
    </Text>
  );

  const containerStyle = [
    styles.base,
    sizeStyles[size],
    selected ? styles.selected : styles.default,
    style,
  ];

  if (onPress === undefined) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      // 카테고리 칩은 디자인상 32dp 라 터치 권장치(48)보다 낮다. 보이는 크기는
      // 그대로 두고 눌리는 범위만 넓힌다 — 아이는 칩을 자주 헛누른다.
      hitSlop={hitSlopFor(visualHeight[size])}
      style={containerStyle}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: colors.primarySelected,
  },
  selected: {
    backgroundColor: colors.primary,
  },
});

/** 눌리는 범위를 계산할 때 쓰는 실제 높이(디자인 실측). */
const visualHeight = {
  md: 32,
  sm: 24,
  lg: 36,
} as const satisfies Record<NonNullable<ChipProps['size']>, number>;

const labelVariant = {
  md: 'chip',
  sm: 'footnote',
  lg: 'label',
} as const satisfies Record<NonNullable<ChipProps['size']>, TypographyVariant>;

const sizeStyles = StyleSheet.create({
  md: {
    height: 32, // 디자인 실측
    paddingHorizontal: spacing.xl,
    borderRadius: 20, // 디자인 실측
  },
  sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3, // 디자인 실측
    borderRadius: radius.xs,
  },
  lg: {
    paddingHorizontal: 14, // 디자인 실측
    paddingVertical: 6, // 디자인 실측
    borderRadius: radius.md,
  },
});
