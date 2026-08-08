import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/shared/theme';

import { Text } from './Text';

export interface DividerProps {
  /** 가운데에 들어갈 문구 (예: "또는"). 없으면 선만 그린다. */
  label?: string;
  style?: ViewStyle;
}

/** 구분선. 라벨을 주면 "──── 또는 ────" 형태가 된다. */
export function Divider({ label, style }: DividerProps): React.JSX.Element {
  if (label === undefined) {
    return <View style={[styles.line, style]} />;
  }

  return (
    <View style={[styles.row, style]}>
      <View style={styles.line} />
      <Text variant="body" color="textSubtle">
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  line: {
    flex: 1,
    height: 2, // 디자인 실측 (1px 이 아니라 2px 이다)
    backgroundColor: colors.divider,
  },
});
