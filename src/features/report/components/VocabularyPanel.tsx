import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import type { ReportVocabulary } from '../model/types';

export interface VocabularyPanelProps {
  childName: string;
  vocabulary: ReportVocabulary;
}

/**
 * 어휘 탭 (Figma 252:219).
 *
 * 표현·논리 탭이 카드 여러 장인 것과 달리, 어휘는 카드 한 장 안에서
 * "쓴 말 → 궁금해한 말 → 말버릇 → 피드백" 순으로 이어진다. 디자인이 그렇다.
 */
export function VocabularyPanel({
  childName,
  vocabulary,
}: VocabularyPanelProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.titleBlock}>
        <Text variant="headingBold" color="primaryText">
          어휘
        </Text>
        <Text variant="caption" color="textMuted">
          이번 이야기에서 사용한 말들
        </Text>
      </View>

      <WordGroup label={`${childName}가 사용한 주요 어휘`} words={vocabulary.used} tone="used" />
      <WordGroup label={`${childName}가 궁금해한 어휘`} words={vocabulary.asked} tone="asked" />

      <Text variant="captionSmall" color="textMuted">
        단어장에서 더 자세히 볼 수 있어요
      </Text>

      {/* 말버릇을 하나도 못 뽑았으면 제목만 남은 빈 블록이 되므로 통째로 뺀다. */}
      {vocabulary.phrases.length > 0 && (
        <View style={styles.group}>
          <Text variant="captionStrong">자주 사용한 표현</Text>
          <View style={styles.phrases}>
            {vocabulary.phrases.map((phrase) => (
              <Text key={phrase} variant="bodySmall">
                {phrase}
              </Text>
            ))}
          </View>
        </View>
      )}

      {vocabulary.phraseNote !== undefined && (
        <Text variant="captionSmall" color="textMuted">
          {vocabulary.phraseNote}
        </Text>
      )}

      <View style={styles.feedback}>
        <Text variant="captionStrong">어휘 피드백</Text>
        <Text variant="caption" color="textStrong" style={styles.feedbackBody}>
          {vocabulary.feedback}
        </Text>
      </View>
    </View>
  );
}

interface WordGroupProps {
  label: string;
  words: readonly string[];
  /** 아이가 쓴 말(주황)인지, 뜻을 물어본 말(파랑)인지 */
  tone: 'used' | 'asked';
}

function WordGroup({ label, words, tone }: WordGroupProps): React.JSX.Element {
  return (
    <View style={styles.group}>
      <Text variant="captionStrong">{label}</Text>
      <View style={styles.tagRow}>
        {words.map((word) => (
          <View key={word} style={[styles.tag, tone === 'used' ? styles.tagUsed : styles.tagAsked]}>
            <Text
              variant="captionSmallStrong"
              color={tone === 'used' ? 'primaryTextDeep' : 'textInfo'}
            >
              {word}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14, // 디자인 실측
    paddingHorizontal: 21, // 디자인 실측
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  titleBlock: {
    gap: 2, // 디자인 실측
  },
  group: {
    gap: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    // 어휘 개수는 서버가 정하므로 한 줄을 넘길 수 있다. 디자인엔 한 줄뿐이지만
    // 넘치면 잘리는 대신 다음 줄로 내려가게 둔다.
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6, // 디자인 실측
    borderRadius: radius.xs,
  },
  tagUsed: {
    backgroundColor: colors.primarySelected,
  },
  tagAsked: {
    backgroundColor: colors.surfaceInfo,
  },
  phrases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingHorizontal: 19, // 디자인 실측
    paddingVertical: spacing.lg,
    borderLeftWidth: 3, // 디자인 실측
    borderLeftColor: colors.primary,
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceAccentWarm,
  },
  feedback: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 15, // 디자인 실측
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  feedbackBody: {
    lineHeight: 22.4, // 디자인 실측
  },
});
