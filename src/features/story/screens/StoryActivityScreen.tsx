import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, spacing } from '@/shared/theme';
import {
  Appear,
  ArrowLeftIcon,
  Button,
  CheckCircleIcon,
  Chip,
  EmptyState,
  PressableScale,
  Screen,
  Text,
} from '@/shared/ui';

import { GuideBubble } from '../components/GuideBubble';
import { OrderCard } from '../components/OrderCard';
import { findActivity, isCorrectOrder, shuffledCards } from '../model/activity';
import { findStory } from '../model/types';

/** 활동은 두 단계다. 지금은 첫 단계(순서 맞추기)만 이 화면이 맡는다. */
const ACTIVITY_STEP = 1;
const ACTIVITY_TOTAL = 2;

/** 아이가 카드를 다 놓고 "다 놓았어요" 를 눌렀을 때의 결과. */
type Result = 'none' | 'correct' | 'wrong';

/**
 * 이야기 후 활동 1/2 — 이야기 순서대로 놓기
 * (Figma 92:993 / 92:1094 / 92:1157 / 92:1215).
 *
 * 네 시안이 같은 화면의 네 순간이라 한 화면으로 합쳤다. 오답일 때 정답을 알려주지
 * 않고 다시 시켜보는 것도 디자인이 정한 규칙이다("정답은 알려주지 않을 거야").
 */
export function StoryActivityScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = findStory(id);
  const activity = findActivity(id);

  /** 아이가 누른 순서대로 쌓인 카드 id. 인덱스 + 1 이 카드에 붙는 숫자다. */
  const [picked, setPicked] = useState<readonly string[]>([]);
  const [result, setResult] = useState<Result>('none');

  const backButton = (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="활동 그만두기"
      onPress={() => router.back()}
      scaleTo={0.94}
      hitSlop={hitSlopFor(24)}
      style={styles.backButton}
    >
      <ArrowLeftIcon width={26} height={15} color={colors.text} />
      <Text variant="heading">이야기 순서대로 놓아볼까?</Text>
    </PressableScale>
  );

  if (activity === undefined) {
    return (
      <Screen>
        <View style={styles.page}>
          {backButton}
          <EmptyState
            title="아직 준비 중인 활동이에요"
            description={`${story?.title ?? '이 이야기'}는 곧 활동도 만들 수 있어요`}
          />
        </View>
      </Screen>
    );
  }

  // 맞혔으면 카드를 고른 순서대로 다시 깔아준다 (디자인 92:1215). 흩어진 자리에
  // 번호만 붙어 있으면 "이야기가 이런 순서였구나"가 한눈에 안 들어온다.
  const cards = result === 'correct' ? activity.cards : shuffledCards(activity);
  const allPicked = picked.length === activity.cards.length;

  const toggle = (cardId: string): void => {
    // 오답을 보고 다시 시작할 때는 눌렀던 걸 모두 지운다.
    if (result !== 'none') {
      setResult('none');
      setPicked([cardId]);
      return;
    }

    setPicked((current) =>
      current.includes(cardId) ? current.filter((item) => item !== cardId) : [...current, cardId],
    );
  };

  const handleSubmit = (): void => {
    setResult(isCorrectOrder(activity, picked) ? 'correct' : 'wrong');
  };

  const retry = (): void => {
    setPicked([]);
    setResult('none');
  };

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.topBar}>
          {result === 'correct' ? (
            <View style={styles.correctHeader}>
              <CheckCircleIcon width={30} height={30} color={colors.primary} />
              <Text variant="title" color="primaryText">
                정답이야!
              </Text>
            </View>
          ) : (
            backButton
          )}
          <Text variant="chip" color="primary">
            {ACTIVITY_STEP}/{ACTIVITY_TOTAL}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.bodyScroll}>
          <View style={styles.body}>
            {result !== 'correct' && (
              <GuideBubble text={guideText(result, picked.length)} emphasis={result === 'wrong'} />
            )}

            <Appear style={styles.cards}>
              {cards.map((card) => {
                const index = picked.indexOf(card.id);

                return (
                  <OrderCard
                    key={card.id}
                    card={card}
                    order={index === -1 ? null : index + 1}
                    onPress={() => toggle(card.id)}
                  />
                );
              })}
            </Appear>

            {result === 'wrong' && (
              <Text variant="label" color="textStrong" align="center">
                정답은 알려주지 않을 거야. 다시 한번 생각해봐!
              </Text>
            )}

            {result === 'correct' && (
              <Appear delay={80} style={styles.keywords}>
                <Text variant="subheading" align="center">
                  핵심 단어
                </Text>
                <View style={styles.keywordRow}>
                  {activity.keywords.map((keyword) => (
                    <Chip key={keyword} label={keyword} size="lg" />
                  ))}
                </View>
              </Appear>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {result === 'correct' ? (
            <Button
              label="이제 이야기를 만들어볼까?"
              size="xl"
              style={styles.wideCta}
              onPress={() => router.replace({ pathname: '/story/[id]/retell', params: { id } })}
            />
          ) : result === 'wrong' ? (
            <Button label="다시 놓아보기" size="xl" onPress={retry} />
          ) : (
            <Button
              label="다 놓았어요"
              size="lg"
              disabled={!allPicked}
              style={styles.cta}
              onPress={handleSubmit}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

/** 안내 문구는 진행 상태에 따라 바뀐다 (디자인 92:993 / 92:1094 / 92:1157). */
function guideText(result: Result, pickedCount: number): string {
  if (result === 'wrong') return '음... 다시 한번 볼까?';
  if (pickedCount > 0) return '잘하고 있어! 계속 놓아보자';

  return '이야기가 어떤 순서였지? 우리, 이야기 순서대로 카드를 눌러 볼까?';
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: spacing.xs,
    paddingBottom: spacing['3xl'],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 디자인 실측
    flexShrink: 1,
  },
  correctHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  bodyScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  body: {
    gap: spacing['3xl'],
    paddingVertical: spacing['2xl'],
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    // 카드 왼쪽 위로 삐져나오는 순번 뱃지가 잘리지 않도록 여유를 둔다.
    gap: 14, // 디자인 실측
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  keywords: {
    gap: spacing.lg,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  cta: {
    width: 175, // 디자인 실측
  },
  wideCta: {
    width: 400, // 디자인 실측
  },
});
