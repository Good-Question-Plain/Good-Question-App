import { useState } from 'react';
import { LayoutAnimation, StyleSheet, View } from 'react-native';

import { avatarTints, colors, radius, spacing } from '@/shared/theme';
import { ChevronRightIcon, PressableScale, Text } from '@/shared/ui';

import type { WordGroup } from '../model/types';

export interface StoryWordGroupProps {
  group: WordGroup;
  tintIndex?: number;
  defaultOpen?: boolean;
  onSelectWord?: (id: string) => void;
}

/** 디자인 실측: 펼친 단어 칩이 한 줄에 3개. */
const COLUMNS = 3;

/**
 * 이야기 하나와 그 안에서 만난 단어들 (Figma 118:120).
 *
 * 접었다 펴는 형태라, 아이가 이야기를 먼저 고르고 단어를 보게 된다.
 * 단어가 많아도 한 화면에 이야기 목록이 다 보이는 게 이 구조의 목적이다.
 */
export function StoryWordGroup({
  group,
  tintIndex = 0,
  defaultOpen = false,
  onSelectWord,
}: StoryWordGroupProps): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  const tint = avatarTints[tintIndex % avatarTints.length];

  const toggle = (): void => {
    // 펼침/접힘은 높이만 변하는 단순한 전환이라 기본 애니메이션으로 충분하다.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  const rows: (typeof group.words)[] = [];
  for (let i = 0; i < group.words.length; i += COLUMNS) {
    rows.push(group.words.slice(i, i + COLUMNS));
  }

  return (
    <View style={styles.card}>
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={toggle}
        scaleTo={0.995}
        style={styles.header}
      >
        <View style={[styles.dot, { backgroundColor: tint }]} />
        <View style={styles.headerText}>
          <Text variant="captionStrong" numberOfLines={1}>
            {group.storyTitle}
          </Text>
          <Text variant="footnote" color="textMuted">
            이 이야기에서 만난 단어 {group.words.length}개
          </Text>
        </View>
        <View style={open ? styles.chevronOpen : undefined}>
          <ChevronRightIcon width={16} height={16} color={colors.textSubtle} />
        </View>
      </PressableScale>

      {open && (
        <View style={styles.body}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((entry) => (
                <PressableScale
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={entry.word}
                  onPress={() => onSelectWord?.(entry.id)}
                  scaleTo={0.97}
                  style={[styles.cell, styles.wordChip]}
                >
                  <Text variant="captionStrong" color="primaryTextDeep">
                    {entry.word}
                  </Text>
                </PressableScale>
              ))}
              {row.length < COLUMNS &&
                Array.from({ length: COLUMNS - row.length }, (_, i) => (
                  <View key={`filler-${i}`} style={styles.cell} />
                ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  dot: {
    width: 28, // 디자인 실측
    height: 28,
    borderRadius: radius.full,
  },
  headerText: {
    flex: 1,
  },
  /** 화살표를 아래로 눕혀 '펼쳐짐'을 나타낸다. */
  chevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  body: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  cell: {
    flex: 1,
  },
  wordChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAccentWarm,
  },
});
