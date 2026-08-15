import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { InitialBadge, ListeningDotsIcon, Text } from '@/shared/ui';

export interface CharacterBubbleProps {
  /** 말하는 등장인물 이름. 뱃지에 첫 글자가 들어간다. */
  speaker: string;
  text: string;
}

/** 등장인물의 말풍선. 왼쪽에 이름 뱃지가 붙는다 (Figma 212:265). */
export function CharacterBubble({ speaker, text }: CharacterBubbleProps): React.JSX.Element {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${speaker}: ${text}`}
      style={styles.characterRow}
    >
      <InitialBadge name={badgeInitial(speaker)} size={32} tintIndex={1} color="primaryTextDeep" />
      <View style={styles.characterBubble}>
        <Text variant="captionSmall" style={styles.characterText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/**
 * 뱃지에 넣을 글자.
 *
 * 이름의 첫 글자를 그냥 쓰면 "첫째 돼지"가 "첫"이 되어 누군지 알 수 없다.
 * 디자인(212:218)은 "돼"를 쓰고 있어, 수식어를 뺀 마지막 낱말에서 가져온다.
 */
function badgeInitial(speaker: string): string {
  const words = speaker.trim().split(/\s+/);

  return words[words.length - 1] ?? speaker;
}

export interface ChildBubbleProps {
  text: string;
  /**
   * 받아 적는 중이라 아직 확정되지 않은 말이면 "너의 말을 듣고 있어" 가 옆에 붙는다.
   * 실시간 전사가 붙기 전까지는 `ListeningHint` 를 따로 쓴다.
   */
  pending?: boolean;
}

/** 아이가 한 말. 오른쪽에 붙고 배경이 주황이다 (Figma 212:229). */
export function ChildBubble({ text, pending = false }: ChildBubbleProps): React.JSX.Element {
  return (
    <View style={styles.childRow}>
      {pending && <ListeningHint />}
      <View style={styles.childBubble}>
        <Text variant="caption" color="primaryTextDeep" style={styles.childText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/**
 * 아이 말을 받는 중이라는 표시 (Figma 216:276).
 *
 * 디자인에서는 실시간으로 받아 적힌 말풍선 옆에 붙어 있다. 아직 전사가 없을
 * 때는 이것만 오른쪽에 놓아, 마이크가 켜져 있다는 걸 대화 흐름에서도 보여준다.
 */
export function ListeningHint(): React.JSX.Element {
  return (
    <View style={styles.hintRow}>
      <View style={styles.pending}>
        <ListeningDotsIcon width={15} height={9} color={colors.primaryTextDeepest} />
        <Text variant="captionSmallStrong" color="primaryTextDeepest">
          너의 말을 듣고 있어
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  characterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  characterBubble: {
    // 말풍선이 화면을 가로지르지 않게 막는다. 디자인의 한 줄짜리 대사는 그대로 들어간다.
    maxWidth: 261, // 디자인 실측. 2단이 되면서 대화 열이 497 로 좁아졌다.
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
  },
  characterText: {
    lineHeight: 21, // 디자인 실측
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 디자인 실측
  },
  childBubble: {
    maxWidth: 261, // 디자인 실측. 2단이 되면서 대화 열이 497 로 좁아졌다.
    paddingHorizontal: 14, // 디자인 실측
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySelected,
  },
  childText: {
    lineHeight: 21, // 디자인 실측
  },
});
