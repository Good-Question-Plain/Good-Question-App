import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { GuideFaceIcon, Text } from '@/shared/ui';

export interface GuideBubbleProps {
  text: string;
  /** 오답을 알려줄 때는 얼굴과 말풍선이 커지고 테두리가 생긴다 (디자인 92:1166). */
  emphasis?: boolean;
}

/**
 * 활동 화면에서 아이에게 말을 거는 안내 캐릭터 (Figma 92:997 / 92:1161).
 *
 * 지시문을 화면 제목으로 쓰지 않고 캐릭터가 말하게 한 건 디자인의 선택이다 —
 * 아이 입장에서 "누가 나한테 말한다"가 지시문보다 따라가기 쉽다.
 */
export function GuideBubble({ text, emphasis = false }: GuideBubbleProps): React.JSX.Element {
  const faceSize = emphasis ? 56 : 48; // 디자인 실측

  return (
    <View style={styles.row}>
      <GuideFaceIcon width={faceSize} height={faceSize} />
      <View style={[styles.bubble, emphasis && styles.bubbleEmphasis]}>
        <Text variant={emphasis ? 'label' : 'caption'}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bubble: {
    paddingHorizontal: 14, // 디자인 실측
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
  },
  bubbleEmphasis: {
    paddingHorizontal: 21, // 디자인 실측
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
