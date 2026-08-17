import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthGate } from '@/features/auth';
import { queryClient, startAuthTokenSync } from '@/shared/api';
import { colors, fontAssets } from '@/shared/theme';
import { VoiceInstallNotice } from '@/shared/ui';

// RN 의 URL 구현이 완전하지 않아 supabase-js 가 내부에서 쓰는 URL 파싱이 깨진다.
// 반드시 supabase 클라이언트를 만들기 전에 로드돼야 해서 최상단에 둔다.
import 'react-native-url-polyfill/auto';

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

  // Supabase 세션의 토큰을 apiClient 에 연결한다. 이걸 켜두면 로그인·로그아웃·
  // 토큰 갱신이 알아서 따라가므로 화면에서 토큰을 직접 다룰 일이 없다.
  useEffect(() => startAuthTokenSync(), []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {/* 세션이 없으면 안쪽 화면(딥링크 포함)을 못 열게 막는다. */}
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </AuthGate>

          {/*
            읽어주기 음성이 없으면 앱을 켠 직후 한 번 알린다.

            `AuthGate` 의 children 이 아니라 **형제**라서 세션을 읽는 동안에도 살아 있다.

            **다른 모달이 떠 있으면 그 뒤에 있다가, 그게 닫히면 보인다.** 안드로이드
            `Modal` 은 나중에 열린 것이 위에 오는데, 로그인 직후에는 아이 선택 모달이
            이 화면보다 뒤에 열리기 때문이다. 보호자가 아이를 고른 직후에 뜨는 셈이라
            "기기를 쥐고 있는 사람에게 묻는다"는 목적에는 그대로 맞는다.
          */}
          <VoiceInstallNotice />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
