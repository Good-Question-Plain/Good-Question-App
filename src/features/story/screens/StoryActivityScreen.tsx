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

import { usePostActivity, useStoryProgress, useSubmitCardOrder } from '../api/queries';
import { GuideBubble } from '../components/GuideBubble';
import { OrderCard } from '../components/OrderCard';
import { KEYWORD_SEPARATOR, type StoryCard } from '../model/activity';

/** 활동은 두 단계다. 지금은 첫 단계(순서 맞추기)만 이 화면이 맡는다. */
const ACTIVITY_STEP = 1;
const ACTIVITY_TOTAL = 2;

/** 아이가 카드를 다 놓고 "다 놓았어요" 를 눌렀을 때의 결과. */
type Result = 'none' | 'correct' | 'wrong';

export interface StoryActivityScreenProps {
  /** 활동은 아이별 세션에 매달려 있다. 라우트가 넘긴다. */
  childId: string;
}

/**
 * 이야기 후 활동 1/2 — 이야기 순서대로 놓기
 * (Figma 92:993 / 92:1094 / 92:1157 / 92:1215).
 *
 * 네 시안이 같은 화면의 네 순간이라 한 화면으로 합쳤다. 오답일 때 정답을 알려주지
 * 않고 다시 시켜보는 것도 디자인이 정한 규칙이다("정답은 알려주지 않을 거야").
 */
export function StoryActivityScreen({ childId }: StoryActivityScreenProps): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const storyId = id ?? '';

  // 활동은 세션 단위라 story_id 로 세션을 먼저 찾아야 한다.
  const { data: progress } = useStoryProgress(childId, storyId);
  const sessionId = progress?.sessionId ?? '';
  const { data: activity } = usePostActivity(sessionId);
  const submit = useSubmitCardOrder(sessionId);

  /** 아이가 누른 순서대로 쌓인 카드 id(= scene_id). 인덱스 + 1 이 카드에 붙는 숫자다. */
  const [picked, setPicked] = useState<readonly string[]>([]);
  const [result, setResult] = useState<Result>('none');
  /** 정답일 때만 서버가 주는 핵심 단어. */
  const [keywords, setKeywords] = useState<readonly string[]>([]);

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
          <EmptyState title="활동을 준비하고 있어요" description="잠시만 기다려주세요" />
        </View>
      </Screen>
    );
  }

  // 서버가 준 카드는 매 요청마다 섞여 있다. 맞혔으면 아이가 고른 순서대로 다시
  // 깔아준다 (디자인 92:1215) — 흩어진 자리에 번호만 붙어 있으면 "이야기가 이런
  // 순서였구나"가 한눈에 안 들어온다.
  const cards: StoryCard[] = activity.cards.map((card) => ({
    id: card.sceneId,
    label: card.title,
    imageUrl: card.imageUrl ?? undefined,
  }));
  const ordered =
    result === 'correct'
      ? picked.map((sceneId) => cards.find((card) => card.id === sceneId)).filter(isCard)
      : cards;
  const allPicked = picked.length === cards.length;

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
    if (submit.isPending) return;

    // 정오답은 서버가 판정한다. 앱은 정답 순서를 모른다.
    submit.mutate([...picked], {
      onSuccess: (outcome) => {
        setResult(outcome.isCorrect ? 'correct' : 'wrong');
        setKeywords(outcome.vocabulary?.map((word) => word.word) ?? []);
      },
    });
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
              {ordered.map((card) => {
                const index = picked.indexOf(card.id);

                return (
                  <OrderCard
                    key={card.id}
                    card={card}
                    order={index === -1 ? null : index + 1}
                    // 맞힌 뒤에는 못 누르게 막는다. 결과를 보다가 무심코 카드를
                    // 누르면 정답 화면이 통째로 사라져 처음부터 다시 놓아야 한다.
                    onPress={result === 'correct' ? undefined : () => toggle(card.id)}
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
                  {keywords.map((keyword) => (
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
              // 핵심 단어는 정답을 맞힐 때만 서버가 준다(`submit` 응답). 다시 받아올
              // 엔드포인트가 없으므로 완료 화면과 같은 방식으로 다음 화면에 넘긴다.
              //
              // **카드 순서도 같이 넘긴다.** 서버가 주는 카드 배열은 섞여 있고 정답
              // 순서는 방금 아이가 맞힌 이 순서뿐이다. 안 넘기면 다시 말하기 화면이
              // 섞인 순서에 1~9 를 붙여서, 아이가 방금 맞춘 것과 다른 번호가 뜬다.
              onPress={() =>
                router.replace({
                  pathname: '/story/[id]/retell',
                  params: {
                    id,
                    keywords: keywords.join(KEYWORD_SEPARATOR),
                    order: ordered.map((card) => card.id).join(KEYWORD_SEPARATOR),
                  },
                })
              }
            />
          ) : result === 'wrong' ? (
            <Button label="다시 놓아보기" size="xl" style={styles.retryCta} onPress={retry} />
          ) : (
            <Button
              label="다 놓았어요"
              size="lg"
              disabled={!allPicked}
              loading={submit.isPending}
              style={styles.cta}
              onPress={handleSubmit}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

function isCard(card: StoryCard | undefined): card is StoryCard {
  return card !== undefined;
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
  // Button 의 기본값이 alignSelf:'flex-start' 라 부모의 alignItems 만으로는
  // 가운데로 오지 않는다. 버튼마다 직접 지정해야 한다.
  cta: {
    width: 175, // 디자인 실측
    alignSelf: 'center',
  },
  wideCta: {
    width: 400, // 디자인 실측
    alignSelf: 'center',
  },
  retryCta: {
    alignSelf: 'center',
  },
});
