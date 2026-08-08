import type { FC } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { avatarTints, colors, radius, spacing } from '@/shared/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface AvatarOptionProps {
  label: string;
  Icon: FC<SvgProps>;
  /** 배경 톤을 고르는 값. 목록에서의 순서를 그대로 넣으면 된다. */
  tintIndex?: number;
  selected?: boolean;
  /** 점선 테두리 + 배경 없음. "사진 올리기", "추가하기" 같은 자리에 쓴다. */
  dashed?: boolean;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * 원형 아바타 하나 + 아래 이름.
 *
 * 아이가 고르는 대상이라 터치 영역이 크고, 선택되면 주황 테두리가 두껍게
 * 둘러진다. 색만으로 구분하지 않는 이유는 색약인 아이도 있기 때문이다.
 */
export function AvatarOption({
  label,
  Icon,
  tintIndex = 0,
  selected = false,
  dashed = false,
  size = 72,
  onPress,
  style,
}: AvatarOptionProps): React.JSX.Element {
  const tint = avatarTints[tintIndex % avatarTints.length];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          dashed ? styles.dashed : { backgroundColor: selected ? avatarTints[0] : tint },
          selected && styles.selected,
        ]}
      >
        <Icon width={size * 0.64} height={size * 0.64} color={colors.textSubtle} />
      </View>
      <Text
        variant={selected ? 'labelSmall' : 'captionSmall'}
        color={dashed ? 'textSubtle' : 'textStrong'}
        align="center"
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.primary,
  },
  dashed: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.full,
  },
});
