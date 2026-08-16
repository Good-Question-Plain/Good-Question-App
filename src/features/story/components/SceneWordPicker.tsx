import { StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import { PressableScale, Text } from '@/shared/ui';

import type { SceneVocabulary } from '../api/progressApi';

export interface SceneWordPickerProps {
  words: readonly SceneVocabulary[];
  onToggle: (word: SceneVocabulary) => void;
  disabled?: boolean;
}

/**
 * 이 장면에 나온 어려운 말들. 누르면 뜻이 펼쳐지고 "궁금해요"로 표시된다.
 *
 * **디자인에 확정 시안이 없다.** 캔버스에 단어 + 체크박스 스케치(417:562 등)가
 * 떠 있지만 화면 안에 배치되지 않은 상태라, 이미 있는 토큰과 패턴으로 만들었다.
 *
 * 모양을 새로 만들지 않고 **단어장의 칩(`surfaceInfo`/`textInfo`)과 같은 색**을
 * 썼다. 아이 입장에서 "궁금해한 어휘"는 단어장에서 파란 칩으로 다시 만나게
 * 되므로, 처음 고르는 자리에서도 같은 색이어야 이어진다.
 *
 * 고른 단어는 서버에 바로 저장돼 리포트의 "궁금해한 어휘"와 단어장이 된다.
 */
export function SceneWordPicker({
  words,
  onToggle,
  disabled = false,
}: SceneWordPickerProps): React.JSX.Element | null {
  if (words.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text variant="captionSmall" color="textMuted">
        모르는 말이 있으면 눌러봐
      </Text>

      <View style={styles.row}>
        {words.map((word) => (
          <PressableScale
            key={word.id}
            accessibilityRole="button"
            accessibilityLabel={`${word.word}${word.selected ? ', 궁금한 말로 표시됨' : ''}`}
            accessibilityState={{ selected: word.selected }}
            disabled={disabled}
            scaleTo={0.94}
            hitSlop={hitSlopFor(32)}
            onPress={() => onToggle(word)}
            style={[styles.chip, word.selected && styles.chipSelected]}
          >
            <Text variant="captionStrong" color={word.selected ? 'textInfo' : 'textStrong'}>
              {word.word}
            </Text>
          </PressableScale>
        ))}
      </View>

      {/* 고른 단어의 뜻은 바로 아래에 펼친다. 아이가 누른 보람이 즉시 보여야 한다. */}
      {words
        .filter((word) => word.selected)
        .map((word) => (
          <View key={word.id} style={styles.meaning}>
            <Text variant="captionStrong" color="textInfo">
              {word.word}
            </Text>
            <Text variant="captionSmall" color="textStrong">
              {word.definition}
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  // 단어장의 "궁금해한 어휘" 칩과 같은 색이라 나중에 다시 만나도 이어진다.
  chipSelected: {
    borderColor: colors.surfaceInfo,
    backgroundColor: colors.surfaceInfo,
  },
  meaning: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceInfo,
  },
});
