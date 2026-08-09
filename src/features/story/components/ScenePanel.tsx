import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import { PressableScale, SpeakerIcon, Text } from '@/shared/ui';

export interface ScenePanelProps {
  /** 패널 위에 붙는 작은 뱃지 ("이야기 줄거리" / "이야기 상황" / "미션") */
  badge: string;
  text: string;
  /** 미션 패널은 글이 가운데로 온다 (디자인 225:345). */
  align?: 'left' | 'center';
  /** TTS 다시 듣기. 없으면 버튼을 그리지 않는다 (미션 패널). */
  onReplay?: () => void;
  style?: ViewStyle;
  children?: ReactNode;
}

/**
 * 대화 화면에서 배경 그림 위에 글을 얹는 패널 (Figma 212:171 / 225:348).
 *
 * 배경이 사진이라 글을 그냥 올리면 읽히지 않는다. 불투명한 회색 판을 깔고
 * 그 위에만 글을 둔다.
 */
export function ScenePanel({
  badge,
  text,
  align = 'left',
  onReplay,
  style,
  children,
}: ScenePanelProps): React.JSX.Element {
  return (
    <View style={[styles.block, style]}>
      <View style={styles.badge}>
        <Text variant="captionSmallStrong" color="primaryTextDeep">
          {badge}
        </Text>
      </View>

      <View style={[styles.panel, align === 'center' && styles.panelCentered]}>
        <Text variant="body" align={align} style={styles.text}>
          {text}
        </Text>
        {children}
      </View>

      {onReplay !== undefined && (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${badge} 다시 듣기`}
          onPress={onReplay}
          hitSlop={hitSlopFor(32)}
          style={styles.replay}
        >
          <SpeakerIcon width={16} height={16} color={colors.textStrong} />
          <Text variant="captionSmallStrong" color="textStrong">
            다시 듣기
          </Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 14, // 디자인 실측
    paddingVertical: 6, // 디자인 실측
    borderRadius: radius.md,
    backgroundColor: colors.primaryAccent,
  },
  panel: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    // 디자인은 높이를 94 로 고정해뒀다. 나레이션 길이는 서버가 정하므로 늘어나게
    // 두되, 짧은 문장에서 판이 쪼그라들지 않도록 최소 높이만 지킨다.
    minHeight: 94,
    paddingHorizontal: 21, // 디자인 실측
    paddingVertical: spacing.xl,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
  },
  panelCentered: {
    alignItems: 'center',
    minHeight: 84, // 디자인 실측
    borderRadius: radius.lg, // 미션 패널만 모서리가 크다 (디자인 실측)
  },
  text: {
    lineHeight: 28.8, // 디자인 실측
  },
  replay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
});
