import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/shared/theme';
import { BottomTabBar, TABS, type TabKey } from '@/shared/ui';

/**
 * 탭 레이아웃.
 *
 * 기본 탭 바 대신 디자인의 알약형 `BottomTabBar` 를 쓴다. expo-router 가 주는
 * 상태(현재 라우트)를 우리 컴포넌트의 API(active/onSelect)로 옮기는 얇은
 * 어댑터가 아래 `renderTabBar` 다.
 *
 * 홈·마이페이지는 아직 디자인이 나오지 않아 라우트만 잡아두고 빈 화면을 둔다.
 */
export default function TabsLayout(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.surface },
      }}
      tabBar={({ state, navigation }) => {
        const active = state.routes[state.index]?.name as TabKey;

        return (
          // 안드로이드 태블릿의 시스템 태스크바가 화면 아래를 덮는다.
          // 인셋만큼 띄우지 않으면 탭 라벨이 그 뒤로 숨는다(실기기에서 확인).
          <View style={[styles.tabBarWrap, { paddingBottom: insets.bottom + spacing.lg }]}>
            <BottomTabBar active={active} onSelect={(key) => navigation.navigate(key)} />
          </View>
        );
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.key} name={tab.key} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // 탭 바는 화면 아래에 떠 있는 알약이라 좌우/아래 여백이 필요하다.
  tabBarWrap: {
    paddingHorizontal: spacing['3xl'],
    backgroundColor: colors.surface,
  },
});
