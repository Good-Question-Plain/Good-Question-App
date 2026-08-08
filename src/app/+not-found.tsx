import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Screen, Text } from '@/shared/ui';

export default function NotFoundScreen(): React.JSX.Element {
  return (
    <>
      <Stack.Screen options={{ title: '페이지를 찾을 수 없음' }} />
      <Screen>
        <View style={styles.container}>
          <Text variant="title">페이지를 찾을 수 없습니다</Text>
          <Link href="/">
            <Text variant="label" color="primary">
              홈으로 돌아가기
            </Text>
          </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
});
