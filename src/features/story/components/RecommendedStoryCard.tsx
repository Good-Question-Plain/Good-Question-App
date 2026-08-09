import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/shared/hooks/useResponsive';
import { colors, radius, spacing } from '@/shared/theme';
import { Chip, PressableScale, Text } from '@/shared/ui';

import type { Story } from '../model/types';

export interface RecommendedStoryCardProps {
  story: Story;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * 홈 오른쪽 "추천 이야기" 목록의 한 줄 (Figma 78:211).
 *
 * 목록 화면의 `StoryCard` 와 달리 가로로 눕고 썸네일이 왼쪽에 붙는다.
 * 세로 공간이 좁은 자리라 카드를 그대로 쓰면 그림이 뭉개져서 따로 둔다.
 */
export function RecommendedStoryCard({
  story,
  onPress,
  style,
}: RecommendedStoryCardProps): React.JSX.Element {
  const { title, minutes, tag, Icon } = story;
  const { select } = useResponsive();

  // 디자인(191/30)은 태블릿 가로 기준이다. 분할 화면처럼 폭이 줄면 썸네일이
  // 글자 자리를 다 먹어 "약 12분"이 세로로 쪼개진다 — 그때는 썸네일을 줄인다.
  const thumbnailWidth = select({ compact: 104, medium: 140, expanded: 191 });
  const gap = select({ compact: spacing.lg, medium: spacing['2xl'], expanded: 30 });

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}, 약 ${minutes}분, ${tag}`}
      onPress={onPress}
      scaleTo={0.985}
      style={[styles.card, { gap }, style]}
    >
      <View style={[styles.thumbnail, { width: thumbnailWidth }]}>
        <Icon width={ART_SIZE} height={ART_SIZE} />
      </View>

      <View style={styles.info}>
        <Text variant="subheading" numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.meta}>
          <Text variant="body" color="textMuted" numberOfLines={1}>
            약 {minutes}분
          </Text>
          <Chip label={tag} size="lg" style={styles.tag} />
        </View>
      </View>
    </PressableScale>
  );
}

const ART_SIZE = 61; // 디자인 실측

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySelected,
  },
  thumbnail: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryAccent,
  },
  info: {
    // 제목이 길면 썸네일을 밀지 않고 말줄임되도록 남는 폭만 쓴다.
    flex: 1,
    gap: spacing.lg,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // 디자인 실측
  },
  // 카드 배경이 이미 옅은 주황이라 태그는 한 단계 진한 톤으로 띄운다.
  tag: {
    backgroundColor: colors.primaryAccent,
  },
});
