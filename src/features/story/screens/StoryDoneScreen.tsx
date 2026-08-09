import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Appear, Button, GuideFaceIcon, Screen, SparkleIcon, Text } from '@/shared/ui';

import { findActivity } from '../model/activity';
import { findScript } from '../model/script';
import { findStory } from '../model/types';

/**
 * 이야기 후 활동 완료 (Figma 92:1340).
 *
 * 아이가 오늘 한 걸 숫자로 보여주고 다음 갈 곳을 둘로만 준다.
 * 축하 화면이라 뒤로가기를 두지 않는다 — 여기서 흐름이 끝난다.
 */
export function StoryDoneScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = findStory(id);
  const script = findScript(id);
  const activity = findActivity(id);

  // 대화에서 아이가 말한 횟수는 장면 수와 같다(장면마다 한 번 답한다).
  const turnCount = script?.scenes.length ?? 0;
  const wordCount = activity?.keywords.length ?? 0;

  return (
    <Screen>
      <View style={styles.page}>
        <Appear from="scale" style={styles.hero}>
          <SparkleIcon width={20} height={20} style={styles.sparkleLeft} />
          <SparkleIcon width={16} height={16} style={styles.sparkleRight} />
          <SparkleIcon width={13} height={13} style={styles.sparkleFar} />
          <GuideFaceIcon width={150} height={150} />
        </Appear>

        <Appear delay={80}>
          <Text variant="title" color="primaryTextDeep" align="center">
            이야기 하나 완성!
          </Text>
        </Appear>

        <Appear delay={140} style={styles.summary}>
          <Text variant="heading">{story?.title ?? '오늘의 이야기'}</Text>
          <View style={styles.rows}>
            <SummaryRow label="발화 횟수" value={`${turnCount}번`} />
            <SummaryRow label="새로 배운 단어" value={`${wordCount}개`} />
          </View>
        </Appear>

        <Appear delay={200} style={styles.actions}>
          <Button
            label="홈으로 돌아가기"
            variant="secondary"
            size="lg"
            style={styles.action}
            onPress={() => router.replace('/(tabs)/home')}
          />
          <Button
            label="다른 이야기 보기"
            size="lg"
            style={styles.action}
            onPress={() => router.replace('/(tabs)/story')}
          />
        </Appear>
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <Text variant="captionStrong">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  hero: {
    // 반짝임을 그림 주변에 놓기 위한 기준 상자. 디자인의 흩뿌린 위치를 옮겼다.
    width: 340,
    alignItems: 'center',
  },
  sparkleLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sparkleRight: {
    position: 'absolute',
    right: 24,
    top: 10,
  },
  sparkleFar: {
    position: 'absolute',
    right: 0,
    top: 62,
  },
  summary: {
    width: 420, // 디자인 실측
    gap: 23, // 디자인 실측
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['2xl'],
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  rows: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  action: {
    width: 200, // 디자인 실측
    height: 52, // 디자인 실측
  },
});
