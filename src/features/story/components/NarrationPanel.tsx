import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import { PressableScale, SpeakerIcon, Text } from '@/shared/ui';

export interface NarrationPanelProps {
  /** 패널 왼쪽 위 뱃지 ("이야기 줄거리" / "이야기 상황") */
  badge: string;
  text: string;
  onReplay: () => void;
  style?: ViewStyle;
}

/**
 * 대화 화면 왼쪽을 통째로 차지하는 줄거리 패널 (Figma 380:274).
 *
 * 2026-08-12 에 대화 화면이 2단으로 바뀌면서 생겼다. 이전에는 배경 그림 위에
 * 가로로 눕는 좁은 판(`ScenePanel`)이었는데, 지금은 화면 왼쪽 절반을 세로로
 * 채우는 큰 판이다. 아이가 글을 읽는 동안 오른쪽 그림이 가려지지 않는다.
 *
 * 미션 패널은 여전히 옛 모양(뱃지 + 좁은 판)이라 `ScenePanel` 을 그대로 쓴다.
 */
export function NarrationPanel({
  badge,
  text,
  onReplay,
  style,
}: NarrationPanelProps): React.JSX.Element {
  return (
    <View style={[styles.panel, style]}>
      <View style={styles.badge}>
        <Text variant="labelBold" color="primaryTextDeep">
          {badge}
        </Text>
      </View>

      {/* 글이 길어지면 늘어나고, 짧으면 "다시 듣기"를 아래로 밀어 붙인다. */}
      <Text variant="body" style={styles.text}>
        {text}
      </Text>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${badge} 다시 듣기`}
        onPress={onReplay}
        hitSlop={hitSlopFor(32)}
        style={styles.replay}
      >
        <SpeakerIcon width={16} height={16} color={colors.textStrong} />
        <Text variant="captionSmall" color="textStrong">
          다시 듣기
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.xl,
    paddingTop: spacing['3xl'], // 디자인 실측(뱃지 y24)
    paddingHorizontal: spacing.xl, // 디자인 실측(뱃지 x16)
    paddingBottom: spacing.lg, // 디자인 실측(다시 듣기 아래 12)
    borderRadius: spacing.xl, // 디자인 실측(16)
    backgroundColor: colors.surfaceAccent,
  },
  badge: {
    paddingHorizontal: 14, // 디자인 실측
    paddingVertical: 6, // 디자인 실측
    borderRadius: radius.md,
    backgroundColor: colors.primaryAccent,
  },
  text: {
    lineHeight: 28.8, // 디자인 실측
  },
  // 남는 세로 공간을 밀어내 항상 오른쪽 아래에 붙는다.
  replay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.md, // 디자인 실측
    paddingVertical: spacing.sm, // 디자인 실측
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
});
