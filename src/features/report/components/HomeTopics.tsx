import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import type { ReportTopic } from '../model/types';

export interface HomeTopicsProps {
  childName: string;
  storyTopics: readonly ReportTopic[];
  dailyTopics: readonly ReportTopic[];
}

/**
 * 집에서 이어가볼까요? (Figma 252:306).
 *
 * 리포트가 "잘했다/못했다" 로 끝나지 않게 보호자가 오늘 저녁에 바로 꺼낼 수 있는
 * 질문으로 마무리하는 자리다. 이야기 안에서 이어가는 주제와 아이의 일상으로
 * 옮겨가는 주제를 나눠 보여준다.
 */
export function HomeTopics({
  childName,
  storyTopics,
  dailyTopics,
}: HomeTopicsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text variant="word" color="primaryText">
          집에서 이어가볼까요?
        </Text>
        <Text variant="bodySmall" color="textStrong">
          {childName}와 함께 나눠볼 수 있는 대화 주제예요
        </Text>
      </View>

      <TopicGroup
        label="이야기 주제 이어가기"
        caption="이야기 속 상황을 더 깊이 이야기해보세요"
        topics={storyTopics}
        accent={colors.primaryReady}
      />
      <TopicGroup
        label="일상생활로 연결하기"
        caption={`${childName}의 경험과 연결해서 이야기해보세요`}
        topics={dailyTopics}
        accent={colors.primarySoft}
      />
    </View>
  );
}

interface TopicGroupProps {
  label: string;
  caption: string;
  topics: readonly ReportTopic[];
  /** 왼쪽 세로 띠 색. 두 묶음을 색으로 구분한다 (디자인 실측). */
  accent: string;
}

function TopicGroup({ label, caption, topics, accent }: TopicGroupProps): React.JSX.Element {
  return (
    <View style={styles.group}>
      <View>
        <Text variant="label">{label}</Text>
        <Text variant="captionSmall" color="textMuted">
          {caption}
        </Text>
      </View>

      {topics.map((topic) => (
        <View key={topic.question} style={[styles.row, { borderLeftColor: accent }]}>
          <Text variant="bodySmall">{topic.question}</Text>
          <Text variant="captionSmall" color="textMuted">
            {topic.practice}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing['2xl'],
    padding: spacing['3xl'],
    borderRadius: spacing.xl,
    backgroundColor: colors.surfaceAccentWarm,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  group: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
    paddingHorizontal: 18, // 디자인 실측
    paddingVertical: spacing.lg,
    borderLeftWidth: 3, // 디자인 실측
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
