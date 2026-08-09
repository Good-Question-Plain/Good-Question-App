import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { PressableScale, Text } from '@/shared/ui';

import type { StoryCard } from '../model/activity';

export interface OrderCardProps {
  card: StoryCard;
  /** 아이가 고른 순번(1부터). 아직 안 골랐으면 null. */
  order: number | null;
  onPress: () => void;
}

/**
 * 이야기 순서 맞추기에 쓰는 카드 (Figma 92:1004 / 92:1219).
 *
 * 고르면 테두리가 굵어지고 주황 후광이 생기며 왼쪽 위에 순번이 붙는다.
 * 글을 아직 못 읽는 아이도 "내가 뭘 골랐는지"를 숫자와 색으로 알 수 있어야 한다.
 */
export function OrderCard({ card, order, onPress }: OrderCardProps): React.JSX.Element {
  const { label, Icon } = card;
  const selected = order !== null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${label}, ${order}번째로 놓음` : label}
      onPress={onPress}
      scaleTo={0.97}
      style={styles.slot}
    >
      {/* 후광. 레이아웃을 밀지 않도록 카드 뒤에 겹쳐 깐다. */}
      {selected && <View style={styles.halo} pointerEvents="none" />}

      <View style={[styles.card, selected ? styles.cardSelected : styles.cardDefault]}>
        <View style={[styles.tile, selected && styles.tileSelected]}>
          <Icon width={ICON_SIZE} height={ICON_SIZE} />
        </View>
        <Text variant="footnote" color="textStrong" align="center" numberOfLines={1}>
          {label}
        </Text>
      </View>

      {selected && (
        <View style={styles.badge}>
          <Text variant="buttonSmall" color="textInverse">
            {order}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

// 전부 디자인 실측.
const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;
const ICON_SIZE = 66;
const BADGE_SIZE = 32;
const HALO_SPREAD = 6;

const styles = StyleSheet.create({
  slot: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  halo: {
    position: 'absolute',
    top: -HALO_SPREAD,
    left: -HALO_SPREAD,
    right: -HALO_SPREAD,
    bottom: -HALO_SPREAD,
    borderRadius: radius.md + HALO_SPREAD,
    // 디자인의 그림자 spread 를 그대로 옮긴 값. RN 은 spread 를 못 그려서 면으로 만든다.
    backgroundColor: 'rgba(255, 146, 0, 0.12)',
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
