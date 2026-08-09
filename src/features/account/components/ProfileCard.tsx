import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import { InitialBadge, PencilIcon, PressableScale, Text } from '@/shared/ui';

export interface ProfileCardProps {
  name: string;
  /** 보호자는 이메일, 아이는 "7세" 처럼 한 줄 아래에 붙는 보조 정보. */
  caption: string;
  /** 'parent' 는 큰 카드(주황 배경), 'child' 는 목록에 들어가는 작은 카드. */
  variant?: 'parent' | 'child';
  tintIndex?: number;
  onEdit?: () => void;
  style?: ViewStyle;
}

/**
 * 이름 + 보조 정보 + 수정 버튼으로 이뤄진 카드.
 *
 * 마이페이지의 보호자 카드와 아이 카드가 같은 구성이라 하나로 묶었다.
 * 크기와 배경만 variant 로 나뉜다 (디자인 234:567).
 */
export function ProfileCard({
  name,
  caption,
  variant = 'child',
  tintIndex = 0,
  onEdit,
  style,
}: ProfileCardProps): React.JSX.Element {
  const isParent = variant === 'parent';

  return (
    <View style={[styles.card, isParent ? styles.parent : styles.child, style]}>
      <InitialBadge name={name} size={isParent ? 52 : 40} tintIndex={isParent ? 1 : tintIndex} />

      <View style={styles.text}>
        <Text variant={isParent ? 'label' : 'captionStrong'} numberOfLines={1}>
          {name}
        </Text>
        <Text variant="footnote" color="textMuted" numberOfLines={1}>
          {caption}
        </Text>
      </View>

      {onEdit !== undefined && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${name} 수정`}
          onPress={onEdit}
          scaleTo={0.85}
          hitSlop={hitSlopFor(isParent ? 18 : 16)}
        >
          <PencilIcon
            width={isParent ? 18 : 16}
            height={isParent ? 18 : 16}
            color={colors.textMuted}
          />
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.md,
  },
  parent: {
    height: 84, // 디자인 실측
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceAccentWarm,
  },
  child: {
    height: 66, // 디자인 실측
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
  },
  text: {
    flex: 1,
  },
});
