import type { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { colors, radius, shadow, spacing } from '@/shared/theme';

import { TabHomeIcon, TabMypageIcon, TabStoryIcon, TabWordbookIcon } from './icons';
import { Text } from './Text';

export type TabKey = 'home' | 'story' | 'wordbook' | 'mypage';

interface TabDef {
  key: TabKey;
  label: string;
  Icon: FC<SvgProps>;
}

/** 탭 순서는 디자인(홈·이야기·단어장·마이페이지)을 따른다. */
export const TABS: readonly TabDef[] = [
  { key: 'home', label: '홈', Icon: TabHomeIcon },
  { key: 'story', label: '이야기', Icon: TabStoryIcon },
  { key: 'wordbook', label: '단어장', Icon: TabWordbookIcon },
  { key: 'mypage', label: '마이페이지', Icon: TabMypageIcon },
] as const;

export interface BottomTabBarProps {
  active: TabKey;
  onSelect: (key: TabKey) => void;
}

/**
 * 하단 알약형 탭 바.
 *
 * 아이콘은 원본 SVG 의 fill 을 `currentColor` 로 바꿔둬서, 활성/비활성 색을
 * `color` prop 하나로 전환한다. 활성 라벨만 굵기가 올라간다.
 */
export function BottomTabBar({ active, onSelect }: BottomTabBarProps): React.JSX.Element {
  return (
    <View style={styles.bar}>
      {TABS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        const tint = isActive ? colors.primary : colors.textSubtle;

        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
            style={styles.tab}
            onPress={() => onSelect(key)}
          >
            <Icon width={ICON_SIZE} height={ICON_SIZE} color={tint} />
            <Text
              variant={isActive ? 'heading' : 'body'}
              color={isActive ? 'primary' : 'textSubtle'}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const ICON_SIZE = 32;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 84, // 디자인 실측
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing['2xl'],
  },
});
