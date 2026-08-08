import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

import { Appear } from './Appear';
import { Screen } from './Screen';
import { Text } from './Text';

export interface AuthCardProps {
  children: ReactNode;
  /** 카드 상단 브랜드 로고를 숨기고 싶을 때 끈다. */
  showBrand?: boolean;
  style?: ViewStyle;
}

/**
 * 회원가입 · 비밀번호 찾기처럼 화면 가운데 카드 하나로 끝나는 흐름의 껍데기.
 *
 * 디자인상 카드는 420 고정 폭이고 배경은 primary/50 계열이다. 여러 단계가
 * 이 카드 안에서 교체되므로, 카드 자체는 여기서 한 번만 정의한다.
 */
export function AuthCard({ children, showBrand = true, style }: AuthCardProps): React.JSX.Element {
  return (
    <Screen scrollable padded={false}>
      <View style={styles.page}>
        <Appear style={[styles.card, style]} from="scale">
          {showBrand && (
            <Text variant="title" color="primary" align="center" style={styles.brand}>
              굿 퀘스천
            </Text>
          )}
          {children}
        </Appear>
      </View>
    </Screen>
  );
}

/** 디자인 실측: 카드 폭 420, 내부 좌우 여백 32. */
const CARD_WIDTH = 420;

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  card: {
    width: CARD_WIDTH,
    padding: 32, // 디자인 실측
    gap: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAccent,
  },
  brand: {
    marginBottom: spacing.xs,
  },
});
