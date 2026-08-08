import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DESIGN_WIDTH, useResponsive } from '@/shared/hooks/useResponsive';
import { colors, spacing } from '@/shared/theme';

export interface ScreenProps {
  children: ReactNode;
  /** 내용이 길어 스크롤이 필요한 화면에서 켠다. */
  scrollable?: boolean;
  /** 좌우 여백을 직접 제어하고 싶을 때(예: 풀블리드 리스트) 끈다. */
  padded?: boolean;
  /**
   * 본문 최대 폭. 기본값은 디자인 기준 폭(1024)이라, 더 넓은 태블릿에서는
   * 늘어나지 않고 가운데 정렬된다. 전체 폭을 써야 하는 화면은 `null` 로 끈다.
   */
  maxContentWidth?: number | null;
  style?: ViewStyle;
}

/**
 * 모든 화면의 바깥 껍데기.
 *
 * 배경색 · 세이프에어리어 · 좌우 여백 · 본문 최대 폭을 한곳에서 처리한다.
 * 화면마다 SafeAreaView 를 따로 쓰기 시작하면 여백이 제각각이 된다.
 */
export function Screen({
  children,
  scrollable = false,
  padded = true,
  maxContentWidth = DESIGN_WIDTH,
  style,
}: ScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { select } = useResponsive();

  const horizontalPadding = padded ? select({ compact: spacing.lg, medium: spacing['2xl'] }) : 0;

  const content = (
    <View
      style={[
        styles.content,
        maxContentWidth !== null && { maxWidth: maxContentWidth, alignSelf: 'center' },
        style,
      ]}
    >
      {children}
    </View>
  );

  const frame: ViewStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left + horizontalPadding,
    paddingRight: insets.right + horizontalPadding,
  };

  if (scrollable) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[frame, styles.scrollContent]}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={[styles.root, frame]}>{content}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
