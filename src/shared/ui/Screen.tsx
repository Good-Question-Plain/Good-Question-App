import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardInset } from '@/shared/hooks/useKeyboardInset';
import { DESIGN_WIDTH, useResponsive } from '@/shared/hooks/useResponsive';
import { colors, spacing } from '@/shared/theme';

export interface ScreenProps {
  children: ReactNode;
  /**
   * 세이프에어리어와 좌우 여백 **바깥까지** 꽉 채우는 배경. 내용 뒤에 깔린다.
   *
   * 대화 화면처럼 배경 그림이 화면 끝까지 가야 하는 경우에 쓴다. children 안에
   * 넣으면 여백만큼 안쪽으로 밀려서 가장자리에 빈 띠가 생긴다.
   */
  backdrop?: ReactNode;
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
  backdrop,
  scrollable = false,
  padded = true,
  maxContentWidth = DESIGN_WIDTH,
  style,
}: ScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardInset();
  const { select } = useResponsive();

  const horizontalPadding = padded ? select({ compact: spacing.lg, medium: spacing['2xl'] }) : 0;

  const content = (
    <View
      style={[
        // 스크롤 화면에서는 flex 대신 flexGrow 를 쓴다. flex:1 은 높이를 뷰포트에
        // 고정해버려서 내용이 넘쳐도 스크롤이 생기지 않고 잘리기만 한다.
        // flexGrow:1 이면 남는 공간은 채우되, 모자라면 자기 높이만큼 넘어간다.
        scrollable ? styles.scrollableContent : styles.content,
        maxContentWidth !== null && { maxWidth: maxContentWidth, alignSelf: 'center' },
        style,
      ]}
    >
      {children}
    </View>
  );

  const frame: ViewStyle = {
    paddingTop: insets.top,
    // 키보드가 올라오면 그만큼 아래를 비운다. edge-to-edge 환경에서는 adjustResize
    // 가 창을 줄여주지 않아서 직접 처리해야 한다 (useKeyboardInset 주석 참고).
    // 키보드 높이에는 내비게이션 바가 이미 포함돼 있어 둘을 더하지 않고 큰 쪽을 쓴다.
    paddingBottom: Math.max(insets.bottom, keyboardInset),
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

  return (
    <View style={[styles.root, frame]}>
      {backdrop !== undefined && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {backdrop}
        </View>
      )}
      {content}
    </View>
  );
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
  scrollableContent: {
    flexGrow: 1,
    width: '100%',
  },
});
