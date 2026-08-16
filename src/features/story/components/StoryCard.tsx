import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, storyTints } from '@/shared/theme';
import { Chip, PressableScale, Text } from '@/shared/ui';

import type { Story } from '../model/types';

export interface StoryCardProps {
  story: Story;
  /** 썸네일 배경 톤을 고르는 값. 목록에서의 순서를 그대로 넣으면 된다. */
  tintIndex?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

/** 이야기 한 편을 나타내는 카드. 썸네일 + 제목 + 소요 시간 + 태그. */
export function StoryCard({
  story,
  tintIndex = 0,
  onPress,
  style,
}: StoryCardProps): React.JSX.Element {
  const { title, minutes, tag, Icon, thumbnailUrl } = story;
  const tint = storyTints[tintIndex % storyTints.length];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}, 약 ${minutes}분`}
      onPress={onPress}
      // 카드는 면적이 넓어 많이 줄이면 과하게 출렁인다.
      scaleTo={0.985}
      style={[styles.card, style]}
    >
      <View style={[styles.thumbnail, { backgroundColor: tint }]}>
        {/* 서버 표지가 있으면 그걸, 없으면 번들 그림. 둘 다 없으면 색면만 남는다. */}
        {thumbnailUrl !== undefined ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          Icon !== undefined && <Icon width={THUMBNAIL_ICON_SIZE} height={THUMBNAIL_ICON_SIZE} />
        )}
      </View>

      <View style={styles.body}>
        <Text variant="label" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="footnote" color="textMuted">
          약 {minutes}분
        </Text>
        <Chip label={tag} size="sm" style={styles.tag} />
      </View>
    </PressableScale>
  );
}

const THUMBNAIL_ICON_SIZE = 70; // 디자인 실측

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  thumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 썸네일 그림은 칸을 꽉 채운다. 디자인도 그림이 잘리는 걸 감수한 크기다.
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tag: {
    marginTop: spacing.xs,
  },
});
