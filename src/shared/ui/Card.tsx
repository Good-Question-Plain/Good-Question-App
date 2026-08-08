import { View, type ViewProps, StyleSheet } from 'react-native';

import { colors, radius, shadow, spacing } from '@/shared/theme';

export interface CardProps extends ViewProps {
  /** 그림자를 빼고 테두리만 쓴다. 카드가 여러 개 나열될 때 시각적 소음을 줄여준다. */
  flat?: boolean;
  padding?: keyof typeof spacing;
}

/** 정보 묶음을 담는 기본 컨테이너. */
export function Card({
  flat = false,
  padding = 'xl',
  style,
  ...rest
}: CardProps): React.JSX.Element {
  return (
    <View
      style={[styles.base, { padding: spacing[padding] }, flat ? styles.flat : shadow.sm, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  flat: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
