import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';

import { Screen } from './Screen';
import { Text } from './Text';

export interface ComingSoonProps {
  title: string;
}

/**
 * 디자인이 아직 나오지 않은 화면의 자리표시자.
 *
 * 탭 구조를 미리 잡아두기 위한 것이라, 디자인이 오면 이 컴포넌트를 쓰는
 * 라우트 파일만 실제 화면으로 갈아끼우면 된다.
 */
export function ComingSoon({ title }: ComingSoonProps): React.JSX.Element {
  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="title" align="center">
          {title}
        </Text>
        <Text variant="body" color="textMuted" align="center">
          디자인 준비 중이에요
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
