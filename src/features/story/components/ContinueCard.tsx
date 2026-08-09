import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/shared/hooks/useResponsive';
import { colors, radius, spacing } from '@/shared/theme';
import { Button, Text } from '@/shared/ui';

import type { Story } from '../model/types';

export interface ContinueCardProps {
  story: Story;
  /** 진행률 0~1 */
  ratio: number;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * 홈 왼쪽의 "이어하기" 카드 (Figma 78:189).
 *
 * 읽다 만 이야기 하나를 크게 보여주고 바로 이어가게 한다. 아이가 홈에서 가장
 * 먼저 누를 것으로 상정된 자리라 화면 절반을 쓴다.
 */
export function ContinueCard({
  story,
  ratio,
  onPress,
  style,
}: ContinueCardProps): React.JSX.Element {
  const { title, Icon } = story;
  const { select } = useResponsive();
  const percent = Math.round(clamp(ratio) * 100);

  const artSize = select({ compact: 180, medium: 248, expanded: ART_SIZE });

  return (
    <View style={[styles.card, style]}>
      <View style={styles.thumbnail}>
        <Icon width={artSize} height={artSize} />
      </View>

      <Text variant="word" numberOfLines={2}>
        {title}
      </Text>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <Text variant="body" color="textMuted">
        {percent}% 완료
      </Text>

      <Button
        label="이어하기"
        size="xl"
        fullWidth
        accessibilityLabel={`${title} 이어하기`}
        onPress={onPress}
      />
    </View>
  );
}

function clamp(ratio: number): number {
  return Math.min(1, Math.max(0, ratio));
}

/**
 * 태블릿 가로에서의 썸네일 안 그림 크기. 디자인 실측(그림 높이 189)이다.
 *
 * 썸네일보다 커서 이야기에 따라 위아래가 잘릴 수 있는데, 잘려도 된다는 판단을
 * 받았다. 크게 보이는 쪽이 이 카드의 목적(읽던 이야기를 알아보게 하기)에 맞는다.
 */
const ART_SIZE = 315;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 15, // 디자인 실측
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 25, // 디자인 실측
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAccentWarm,
  },
  thumbnail: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16, // 디자인 실측
    backgroundColor: colors.primarySelected,
  },
  track: {
    height: 8, // 디자인 실측
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
