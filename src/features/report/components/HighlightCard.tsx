import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import type { LearningReport } from '../model/types';

export interface HighlightCardProps {
  childName: string;
  highlight: LearningReport['highlight'];
}

/**
 * 오늘의 대표 발화 (Figma 252:298).
 *
 * 보호자가 리포트에서 가장 먼저 읽게 하고 싶은 한 문장이라 위쪽 테두리를
 * 두껍게(4) 둘러 다른 카드와 구분한다.
 */
export function HighlightCard({ childName, highlight }: HighlightCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.titleBlock}>
        <Text variant="subheadingBold" color="primaryText">
          오늘의 대표 발화
        </Text>
        <Text variant="captionSmall" color="textMuted">
          {childName}의 말하기 강점이 가장 잘 드러난 순간이에요
        </Text>
      </View>

      <View style={styles.quote}>
        <Text style={styles.quoteText}>{highlight.quote}</Text>
      </View>

      <View style={styles.reason}>
        <Text variant="captionStrong" color="textStrong">
          선정 이유
        </Text>
        <Text variant="captionSmall" color="textStrong" style={styles.reasonBody}>
          {highlight.reason}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderTopWidth: 4, // 디자인 실측
    borderRadius: radius.md,
    borderColor: colors.primaryReady,
    backgroundColor: colors.surface,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  quote: {
    padding: spacing['2xl'],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAccentWarm,
  },
  quoteText: {
    lineHeight: 30.6, // 디자인 실측
  },
  reason: {
    gap: spacing.xs,
    padding: spacing.xl,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  reasonBody: {
    lineHeight: 22.4, // 디자인 실측
  },
});
