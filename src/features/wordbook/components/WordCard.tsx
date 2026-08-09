import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
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
    // 하트는 카드 안에 있지만 **누르는 영역은 겹치면 안 된다.** 눌림 영역을 중첩하면
    // 스크린리더가 두 버튼을 겹쳐 읽고, 웹에서는 button 안의 button 이 되어 DOM 이
    // 깨진다. 그래서 형제로 두고 위에 얹는다.
    <View style={[styles.slot, style]}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${word}, ${storyTitle}`}
        onPress={onPress}
        scaleTo={0.985}
        style={styles.card}
      >
        {/* 하트가 차지하던 자리. 빼면 단어가 위로 올라붙는다. */}
        <View style={styles.heartSpacer} />

        <Text variant="word" color="primaryTextDeep" align="center" numberOfLines={2}>
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

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={saved ? '저장 해제' : '저장'}
        accessibilityState={{ selected: saved }}
        onPress={onToggleSave}
        scaleTo={0.85}
        hitSlop={hitSlopFor(HEART_SIZE)}
        style={styles.heart}
      >
        <HeartIcon
          width={HEART_SIZE}
          height={HEART_SIZE}
          color={saved ? colors.primary : colors.borderStrong}
        />
      </PressableScale>
    </View>
  );
}

const HEART_SIZE = 18; // 디자인 실측

const styles = StyleSheet.create({
  // 카드 크기는 호출부(style)가 정한다. 하트를 얹기 위한 기준 상자일 뿐이다.
  slot: {},
  card: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingVertical: 13, // 디자인 실측
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  heartSpacer: {
    height: HEART_SIZE,
  },
  // 카드 안 오른쪽 위. 카드의 패딩과 같은 값이라 원래 자리 그대로다.
  heart: {
    position: 'absolute',
    top: 13, // 카드의 paddingVertical
    right: spacing.lg, // 카드의 paddingHorizontal
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
