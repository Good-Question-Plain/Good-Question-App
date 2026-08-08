import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/shared/api';
import { colors, fontAssets } from '@/shared/theme';

// 폰트가 준비될 때까지 스플래시를 유지한다. 이걸 빼면 시스템 폰트로 한 프레임
// 그려졌다가 Pretendard 로 바뀌면서 글자가 튀어 보인다.
void SplashScreen.preventAutoHideAsync();

/**
 * 앱 루트 레이아웃.
 *
 * 전역 Provider 는 전부 여기에만 둔다. 순서가 중요해서
 * GestureHandlerRootView → SafeAreaProvider → QueryClientProvider 로 감싼다.
 */
export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    // 폰트 로딩이 실패해도 스플래시에 갇히지 않도록 에러일 때도 내린다.
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
