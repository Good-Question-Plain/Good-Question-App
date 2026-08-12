import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, hitSlopFor, spacing } from '@/shared/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface PillTabsProps<T extends string> {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

/**
 * 알약형 탭 (Figma 284:202). 리포트의 어휘 / 표현 / 논리 전환에 쓴다.
 *
 * 같은 화면 안의 필터라는 점은 `SegmentedTabs` 와 같지만 모양이 다르다 —
 * 밑줄 대신 알약을 통째로 칠한다. 두 화면의 디자인이 실제로 다르므로 한쪽에
 * variant 를 붙여 합치지 않고 별도 컴포넌트로 뒀다.
 */
export function PillTabs<T extends string>({
  items,
  value,
  onChange,
  style,
}: PillTabsProps<T>): React.JSX.Element {
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
            // 디자인상 32dp 라 터치 권장치(48)보다 낮다. 보이는 크기는 그대로 두고
            // 눌리는 범위만 넓힌다.
            hitSlop={hitSlopFor(PILL_HEIGHT)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillIdle]}
          >
            <Text variant="chip" color={isActive ? 'textInverse' : 'textMuted'}>
              {item}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const PILL_HEIGHT = 32; // 디자인 실측

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5, // 디자인 실측
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    height: PILL_HEIGHT,
    paddingHorizontal: spacing['2xl'],
    borderRadius: 20, // 디자인 실측
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillIdle: {
    backgroundColor: colors.surfaceSubtle,
  },
});
