import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import type { ReportSkill } from '../model/types';

export interface SkillPanelProps {
  /** 탭 이름이자 섹션 제목 (표현 / 논리) */
  title: string;
  skills: readonly ReportSkill[];
}

/**
 * 표현·논리 탭 (Figma 252:249).
 *
 * 두 탭은 제목만 다르고 카드 모양이 같아 한 컴포넌트로 둔다.
 */
export function SkillPanel({ title, skills }: SkillPanelProps): React.JSX.Element {
  return (
    <View style={styles.panel}>
      <Text variant="subheadingBold" color="primaryText">
        {title}
      </Text>

      {skills.map((skill) => (
        <View key={skill.title} style={styles.card}>
          <Text variant="bodyBold">{skill.title}</Text>
          <Text variant="captionSmallStrong" style={styles.summary}>
            {skill.summary}
          </Text>

          <View style={styles.quote}>
            <Text variant="bodySmall">{skill.quote}</Text>
          </View>

          <View style={styles.notes}>
            {skill.notes.map((note) => (
              <Text key={note} variant="captionSmall" color="textStrong">
                {note}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
    padding: 21, // 디자인 실측
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surface,
  },
  summary: {
    lineHeight: 25.6, // 디자인 실측
  },
  // 디자인은 높이 36 고정이지만, 아이 말이 길면 잘린다. 세로 여백으로 바꿔 늘어나게 뒀다.
  quote: {
    paddingHorizontal: 14, // 디자인 실측
    paddingVertical: spacing.sm,
    borderLeftWidth: 3, // 디자인 실측
    borderLeftColor: colors.primary,
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceAccentWarm,
  },
  notes: {
    gap: spacing.xs,
  },
});
