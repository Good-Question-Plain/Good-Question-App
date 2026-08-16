import { Image, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { PressableScale, Text } from '@/shared/ui';

import type { StoryCard } from '../model/activity';

export interface OrderCardProps {
  card: StoryCard;
  /** 아이가 고른 순번(1부터). 아직 안 골랐으면 null. */
  order: number | null;
  /** `sm` 은 활동 2/2 아래에 참고용으로 늘어놓는 작은 카드다 (디자인 234:504). */
  size?: 'md' | 'sm';
  /** 누를 수 없는 참고용 카드일 때 끈다. */
  onPress?: () => void;
}

/**
 * 이야기 순서 맞추기에 쓰는 카드 (Figma 92:1004 / 92:1219).
 *
 * 고르면 테두리가 굵어지고 주황 후광이 생기며 왼쪽 위에 순번이 붙는다.
 * 글을 아직 못 읽는 아이도 "내가 뭘 골랐는지"를 숫자와 색으로 알 수 있어야 한다.
 */
export function OrderCard({
  card,
  order,
  size = 'md',
  onPress,
}: OrderCardProps): React.JSX.Element {
  const { label, Icon, imageUrl } = card;
  const selected = order !== null;
  const small = size === 'sm';
  const iconSize = small ? SMALL_ICON_SIZE : ICON_SIZE;

  const body = (
    <>
      {/* 후광. 레이아웃을 밀지 않도록 카드 뒤에 겹쳐 깐다. */}
      {selected && !small && <View style={styles.halo} pointerEvents="none" />}

      <View
        style={[
          styles.card,
          selected ? styles.cardSelected : styles.cardDefault,
          small && styles.cardSmall,
        ]}
      >
        <View style={[styles.tile, selected && styles.tileSelected]}>
          {/* 서버 그림이 있으면 그걸 쓰고, 없으면 번들 아이콘으로 떨어진다.
              둘 다 없으면 빈 타일이 남는데 카드 크기는 그대로라 배열은 안 깨진다. */}
          {imageUrl !== undefined ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: iconSize, height: iconSize }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : (
            Icon !== undefined && <Icon width={iconSize} height={iconSize} />
          )}
        </View>
        <Text
          variant={small ? 'captionSmall' : 'footnote'}
          color="textStrong"
          align="center"
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>

      {selected && (
        <View style={styles.badge}>
          <Text variant={small ? 'badge' : 'buttonSmall'} color="textInverse">
            {order}
          </Text>
        </View>
      )}
    </>
  );

  const slotStyle = small ? styles.slotSmall : styles.slot;

  if (onPress === undefined) {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={`${order}번째, ${label}`}
        style={slotStyle}
      >
        {body}
      </View>
    );
  }

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${label}, ${order}번째로 놓음` : label}
      onPress={onPress}
      scaleTo={0.97}
      style={slotStyle}
    >
      {body}
    </PressableScale>
  );
}

// 전부 디자인 실측.
const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;
const ICON_SIZE = 66;
const SMALL_CARD_HEIGHT = 147;
const SMALL_ICON_SIZE = 44;
const BADGE_SIZE = 32;
const HALO_SPREAD = 6;

const styles = StyleSheet.create({
  slot: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  slotSmall: {
    flex: 1,
    height: SMALL_CARD_HEIGHT,
  },
  halo: {
    position: 'absolute',
    top: -HALO_SPREAD,
    left: -HALO_SPREAD,
    right: -HALO_SPREAD,
    bottom: -HALO_SPREAD,
    borderRadius: radius.md + HALO_SPREAD,
    // RN 은 그림자 spread 를 못 그려서 같은 색 면으로 대신한다.
    backgroundColor: colors.primaryHalo,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  cardDefault: {
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderWidth: 3, // 디자인 실측
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAccentWarm,
  },
  cardSmall: {
    padding: 11, // 디자인 실측
  },
  tile: {
    flex: 1,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAccentWarm,
  },
  tileSelected: {
    backgroundColor: colors.primarySelected,
  },
  badge: {
    position: 'absolute',
    top: -12, // 디자인 실측
    left: -12,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
