import type { FC } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { colors, spacing, type ColorToken } from '@/shared/theme';

import { ChevronRightIcon } from './icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface MenuRowProps {
  label: string;
  Icon: FC<SvgProps>;
  /** 라벨과 아이콘 색. 로그아웃(주황)·회원탈퇴(빨강)처럼 강조가 필요할 때 바꾼다. */
  tone?: ColorToken;
  /** 다음 화면으로 넘어가는 항목만 오른쪽 화살표를 보여준다. */
  showChevron?: boolean;
  /** 목록 마지막 줄은 아래 구분선을 그리지 않는다. */
  last?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * 설정 목록의 한 줄. 아이콘 + 라벨 (+ 오른쪽 화살표).
 *
 * 화살표는 "누르면 다른 화면으로 간다"는 뜻이라, 그 자리에서 처리되는
 * 로그아웃·회원탈퇴에는 붙이지 않는다 (디자인 118:291 도 같다).
 */
export function MenuRow({
  label,
  Icon,
  tone = 'text',
  showChevron = false,
  last = false,
  onPress,
  style,
}: MenuRowProps): React.JSX.Element {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.995}
      style={[styles.row, !last && styles.divider, style]}
    >
      <View style={styles.left}>
        <Icon width={ICON_SIZE} height={ICON_SIZE} color={colors[tone]} />
        <Text variant="caption" color={tone}>
          {label}
        </Text>
      </View>
      {showChevron && <ChevronRightIcon width={16} height={16} color={colors.borderStrong} />}
    </PressableScale>
  );
}

const ICON_SIZE = 18; // 디자인 실측

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14, // 디자인 실측
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerSubtle,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
});
