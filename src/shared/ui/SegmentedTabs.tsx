import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/shared/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SegmentedTabsProps<T extends string> {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

/**
 * 밑줄형 탭. 화면 안에서 목록을 거를 때 쓴다 (단어장의 전체 / 이야기별).
 *
 * 하단 `BottomTabBar` 와 달리 화면 이동이 아니라 같은 화면의 필터라서,
 * 눌린 항목만 주황 밑줄로 표시한다.
 */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  style,
}: SegmentedTabsProps<T>): React.JSX.Element {
  return (
    <View style={[styles.row, style]} accessibilityRole="tablist">
      {items.map((item) => {
        const isActive = item === value;

        return (
          <PressableScale
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item)}
            scaleTo={0.94}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text variant="labelSmall" color={isActive ? 'primary' : 'textMuted'}>
              {item}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing['3xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  tab: {
    paddingBottom: spacing.md,
    borderBottomWidth: 3, // 디자인 실측
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
});
