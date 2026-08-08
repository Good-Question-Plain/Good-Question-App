import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { HeartFillIcon, HeartLineIcon, PressableScale, Text } from '@/shared/ui';

import type { WordEntry } from '../model/types';

export interface WordCardProps {
  entry: WordEntry;
  onToggleSave?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * 저장한 단어 카드.
 *
 * 아이는 아직 글을 빠르게 읽지 못하므로 단어 자체를 크게(24) 두고,
 * 출처 이야기는 아래에 작게 붙인다. 아이 이름은 첫 글자만 원형 뱃지로 보여
 * 여러 아이의 단어가 섞여도 누구 것인지 한눈에 구분되게 했다.
 */
export function WordCard({
  entry,
  onToggleSave,
  onPress,
  style,
}: WordCardProps): React.JSX.Element {
  const { word, storyTitle, childName, saved } = entry;
  const HeartIcon = saved ? HeartFillIcon : HeartLineIcon;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${word}, ${storyTitle}`}
      onPress={onPress}
      scaleTo={0.985}
      style={[styles.card, style]}
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={saved ? '저장 해제' : '저장'}
        accessibilityState={{ selected: saved }}
        onPress={onToggleSave}
        scaleTo={0.85}
        style={styles.heart}
      >
        <HeartIcon width={18} height={18} color={saved ? colors.primary : colors.borderStrong} />
      </PressableScale>

      <Text variant="word" color="primaryTextDeep" align="center">
        {word}
      </Text>

      <View style={styles.footer}>
        <View style={styles.childBadge}>
          <Text variant="badge">{childName.slice(0, 1)}</Text>
        </View>
        <Text variant="caption" color="textMuted" numberOfLines={1} style={styles.storyTitle}>
          {storyTitle}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'space-between',
    gap: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingVertical: 13, // 디자인 실측
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  heart: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  childBadge: {
    width: 26, // 디자인 실측
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.primarySelected,
  },
  storyTitle: {
    flex: 1,
  },
});
