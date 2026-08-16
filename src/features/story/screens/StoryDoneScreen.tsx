import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Appear, Button, EmptyState, GuideFaceIcon, Screen, SparkleIcon, Text } from '@/shared/ui';

/**
 * 완료 화면이 보여줄 값은 **앞 화면(다시 말하기)의 `retell` 응답**이 준다.
 * 다시 받아올 엔드포인트가 없어서 라우트 파라미터로 넘겨받는다.
 */

/**
 * 이야기 후 활동 완료 (Figma 92:1340).
 *
 * 아이가 오늘 한 걸 숫자로 보여주고 다음 갈 곳을 둘로만 준다.
 * 축하 화면이라 뒤로가기를 두지 않는다 — 여기서 흐름이 끝난다.
 */
export function StoryDoneScreen(): React.JSX.Element {
  const router = useRouter();
  const { title, turns, words } = useLocalSearchParams<{
    title?: string;
    turns?: string;
    words?: string;
  }>();

  // 활동을 거치지 않고 곧장 들어온 경우(오래된 링크, 딥링크). 0번·0개짜리
  // 축하 화면을 띄우면 하지도 않은 걸 했다고 알리는 셈이라, 그대로 사실을 알린다.
  if (turns === undefined || words === undefined) {
    return (
      <Screen>
        <View style={styles.page}>
          <EmptyState title="아직 마칠 이야기가 없어요" description="이야기를 먼저 나눠볼까요?" />
          <Button
            label="이야기 보러 가기"
            size="lg"
            style={styles.centered}
            onPress={() => router.replace('/(tabs)/story')}
          />
        </View>
      </Screen>
    );
  }

  const turnCount = Number(turns);
  const wordCount = Number(words);

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
          <Text variant="heading">{title ?? '오늘의 이야기'}</Text>
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
  // Button 은 기본이 alignSelf:'flex-start' 라 세로 스택 안에서는 직접 가운데로 보낸다.
  centered: {
    alignSelf: 'center',
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
