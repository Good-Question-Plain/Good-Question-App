import { type FC, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { colors, motion, radius, shadow, spacing } from '@/shared/theme';

import { TabHomeIcon, TabMypageIcon, TabStoryIcon, TabWordbookIcon } from './icons';
import { PressableScale } from './PressableScale';
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
 * `color` prop 하나로 전환한다.
 */
export function BottomTabBar({ active, onSelect }: BottomTabBarProps): React.JSX.Element {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => (
        <TabItem key={tab.key} tab={tab} isActive={tab.key === active} onSelect={onSelect} />
      ))}
    </View>
  );
}

interface TabItemProps {
  tab: TabDef;
  isActive: boolean;
  onSelect: (key: TabKey) => void;
}

/**
 * 선택된 탭은 아이콘이 살짝 커지면서 위로 뜬다.
 *
 * 글자를 아직 잘 못 읽는 아이도 "지금 여기"를 알 수 있게, 색만이 아니라
 * 크기/위치로도 현재 탭을 구분한다.
 */
function TabItem({ tab, isActive, onSelect }: TabItemProps): React.JSX.Element {
  const { key, label, Icon } = tab;
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(isActive ? 1 : 0));

  useEffect(() => {
    const target = isActive ? 1 : 0;
    if (reduceMotion) {
      progress.setValue(target);
      return;
    }
    const animation = Animated.spring(progress, {
      toValue: target,
      damping: motion.springBouncy.damping,
      stiffness: motion.springBouncy.stiffness,
      mass: motion.springBouncy.mass,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [isActive, progress, reduceMotion]);

  const iconStyle = {
    transform: [
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
    ],
  };

  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
      style={styles.tab}
      onPress={() => onSelect(key)}
    >
      <Animated.View style={iconStyle}>
        <Icon
          width={ICON_SIZE}
          height={ICON_SIZE}
          color={isActive ? colors.primary : colors.textSubtle}
        />
      </Animated.View>
      <Text variant={isActive ? 'heading' : 'body'} color={isActive ? 'primary' : 'textSubtle'}>
        {label}
      </Text>
    </PressableScale>
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
