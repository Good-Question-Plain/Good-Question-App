import { StyleSheet, type ViewStyle } from 'react-native';

import { colors, hitSize, radius, spacing } from '@/shared/theme';

import { ChevronDownIcon } from './icons';
import { InitialBadge } from './InitialBadge';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ChildSwitcherProps {
  /** 지금 쓰고 있는 아이 이름 */
  name: string;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * 지금 쓰는 아이를 보여주고, 누르면 전환 모달을 여는 알약 (Figma 141:589).
 *
 * 아이 이름 하나만 알면 되므로 도메인 타입을 끌고 오지 않는다.
 * 어떤 모달을 열지는 호출부가 정한다.
 */
export function ChildSwitcher({ name, onPress, style }: ChildSwitcherProps): React.JSX.Element {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`사용 중인 아이 ${name}, 눌러서 바꾸기`}
      onPress={onPress}
      style={[styles.pill, style]}
    >
      <InitialBadge name={name} size={BADGE_SIZE} />
      <Text variant="chip" numberOfLines={1} style={styles.name}>
        {name}
      </Text>
      <ChevronDownIcon width={14} height={14} color={colors.textStrong} />
    </PressableScale>
  );
}

const BADGE_SIZE = 26; // 디자인 실측

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: hitSize.min,
    paddingHorizontal: 14, // 디자인 실측
    borderRadius: radius.sm,
    // 디자인은 흰 배경 위의 #F8F9FA 알약이지만, 앱의 페이지 배경이 그 #F8F9FA 라
    // 그대로 쓰면 알약이 사라진다. 대비 관계를 유지하려고 색을 뒤집었다.
    backgroundColor: colors.surface,
  },
  // 이름이 길면 알약이 헤더를 밀어내지 않도록 폭을 제한한다 (디자인엔 두 글자만 있다).
  name: {
    maxWidth: 120,
  },
});
