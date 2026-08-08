import { StyleSheet, View, type ViewStyle } from 'react-native';

import { spacing } from '@/shared/theme';

import { Text } from './Text';

export interface EmptyStateProps {
  title: string;
  description?: string;
  style?: ViewStyle;
}

/**
 * 목록이 비었을 때 자리를 채우는 안내.
 *
 * 빈 화면을 그대로 두면 아이는 "고장났다"고 인식하고 같은 곳을 계속 누른다.
 * 실제로 '용기' 카테고리를 고르면 화면이 통째로 비는 걸 기기에서 확인했다.
 *
 * 삽화가 있으면 더 좋지만 디자인 세트에 빈 상태용 그림이 아직 없다.
 * 아이콘을 임의로 만들지 않고 문구만 두었다 — 시안이 나오면 여기에 추가한다.
 */
export function EmptyState({ title, description, style }: EmptyStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      <Text variant="heading" color="textMuted" align="center">
        {title}
      </Text>
      {description !== undefined && (
        <Text variant="body" color="textSubtle" align="center">
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['5xl'],
  },
});
