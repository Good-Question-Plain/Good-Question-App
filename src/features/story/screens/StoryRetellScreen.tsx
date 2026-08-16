import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import {
  Appear,
  ArrowLeftIcon,
  Button,
  Chip,
  EmptyState,
  GuideFaceIcon,
  MicIcon,
  PressableScale,
  Screen,
  Text,
} from '@/shared/ui';

import { usePostActivity, useStoryProgress, useSubmitRetelling } from '../api/queries';
import { OrderCard } from '../components/OrderCard';
import { useDictation } from '../hooks/useDictation';
import { KEYWORD_SEPARATOR } from '../model/activity';
import { useDemoSessionStore } from '../model/demoSessionStore';

const ACTIVITY_STEP = 2;

export interface StoryRetellScreenProps {
  /** 활동은 아이별 세션에 매달려 있다. 라우트가 넘긴다. */
  childId: string;
}
const ACTIVITY_TOTAL = 2;

/**
 * 이야기 후 활동 2/2 — 이야기 다시 말하기 (Figma 92:1290).
 *
 * 아이가 앞에서 맞춘 카드와 핵심 단어를 보면서 이야기를 자기 말로 다시 한다.
 * 받아쓴 글이 화면 한가운데 크게 남는 게 이 활동의 결과물이다.
 */
export function StoryRetellScreen({ childId }: StoryRetellScreenProps): React.JSX.Element {
  const router = useRouter();
  const { id, keywords, order } = useLocalSearchParams<{
    id: string;
    keywords?: string;
    order?: string;
  }>();
  const storyId = id ?? '';

  /**
   * 핵심 단어 (디자인 92:1290 의 "핵심 단어" 칩).
   *
   * 순서 맞추기에서 정답을 맞힐 때 서버가 주는 값이고(`submit` 응답의
   * `vocabulary`), 앞 화면이 라우트 파라미터로 넘겨준다. 다시 받아올
   * 엔드포인트가 없어서 이 화면에서 조회할 수 없다.
   * 구분자는 보내는 쪽과 같은 `KEYWORD_SEPARATOR` 를 쓴다 (거기 이유를 적어뒀다).
   */
  const keyWords =
    keywords === undefined || keywords === '' ? [] : keywords.split(KEYWORD_SEPARATOR);

  const { data: progress } = useStoryProgress(childId, storyId);
  const sessionId = progress?.sessionId ?? '';
  const { data: activity } = usePostActivity(sessionId);
  const submit = useSubmitRetelling(sessionId);
  /**
   * 받아쓰기.
   *
   * `POST .../retell` 은 완성된 **텍스트**를 받는데 서버에 음성을 글로 바꿔주는
   * 엔드포인트가 없어서, 안드로이드 내장 음성인식으로 앱에서 직접 받아쓴다
   * (`useDictation`). 서버가 음성 파일을 받게 바뀌면 여기만 갈아끼운다.
   */
  const dictation = useDictation();
  const demo = useDemoSessionStore();
  const transcript = dictation.text;
  /** 마이크를 한 번이라도 눌렀는지. 완료 버튼을 열어주는 조건 중 하나다. */
  const [spoke, setSpoke] = useState(false);
  const recording = dictation.isListening;

  /**
   * 완료 버튼을 열어줄지.
   *
   * **말을 한 번 해보고 멈췄으면 연다.** 받아쓴 글이 있어야만 열면, 조용한 방이나
   * 발음이 잘 안 잡히는 아이는 **활동에서 영영 못 빠져나온다** — 실제로 인식기가
   * 정상인데 아무것도 안 잡혀서 버튼이 계속 잠긴 상태를 만났다. 인식기가 없거나
   * 권한이 막힌 경우(`failure`)도 마찬가지다.
   *
   * 그때는 빈 텍스트가 서버로 가지만, **이야기를 끝낸 사실 자체는 남는 게 낫다.**
   */
  const canFinish = transcript.trim().length > 0 || (spoke && !recording);

  const backButton = (
    <PressableScale
      accessibilityRole="button"
      // 활동 사이 이동은 replace 라 뒤로가기는 앞 활동이 아니라 이야기 상세로 간다.
      // 이미 맞힌 순서 맞추기를 다시 시키는 것보다 이쪽이 낫다.
      accessibilityLabel="활동 그만두기"
      onPress={() => router.back()}
      scaleTo={0.94}
      hitSlop={hitSlopFor(24)}
      style={styles.backButton}
    >
      <ArrowLeftIcon width={26} height={15} color={colors.text} />
      <Text variant="heading">이야기를 다시 말해볼까?</Text>
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

  /**
   * 이야기 카드를 **아이가 방금 맞힌 순서**로 세운다.
   *
   * 서버가 주는 `activity.cards` 는 섞여 있고(매 요청마다 다시 섞인다), 정답
   * 순서를 알려주는 응답은 없다. 앞 화면이 넘겨준 순서를 쓰지 않으면 섞인 배열에
   * 1~9 를 붙이게 되어, **아이가 방금 맞춘 것과 다른 번호가 카드에 뜬다.**
   *
   * 순서를 못 받았거나(직접 이 화면으로 들어온 경우) 목록이 어긋나면 서버 순서
   * 그대로 둔다 — 번호가 틀리는 것보다는 낫다.
   */
  const orderedCards = (() => {
    if (order === undefined || order === '') return activity.cards;

    const sceneIds = order.split(KEYWORD_SEPARATOR);
    const sorted = sceneIds
      .map((sceneId) => activity.cards.find((card) => card.sceneId === sceneId))
      .filter((card) => card !== undefined);

    return sorted.length === activity.cards.length ? sorted : activity.cards;
  })();

  const handleMicPress = (): void => {
    setSpoke(true);

    if (recording) {
      dictation.stop();
      return;
    }
    void dictation.start();
  };

  const handleDone = (): void => {
    if (submit.isPending) return;

    submit.mutate(transcript, {
      // 완료 화면이 보여줄 값(제목·발화 횟수·단어 수)을 서버가 여기서 준다.
      // 다시 받아올 엔드포인트가 없으므로 그대로 다음 화면에 넘긴다.
      onSuccess: (result) =>
        router.replace({
          pathname: '/story/[id]/done',
          params: {
            id: storyId,
            title: result.storyTitle,
            // 서버는 아이 발화를 하나도 못 받았으므로 0 을 준다(인수인계 1-1).
            // 그럴 때만 앱이 세어둔 값으로 채운다 — 완료 화면이 "0번 · 0개" 로 남으면
            // 이야기를 끝낸 보람이 사라진다.
            turns: String(result.utteranceCount > 0 ? result.utteranceCount : demo.utterances),
            words: String(
              result.newVocabularyCount > 0 ? result.newVocabularyCount : demo.words.length,
            ),
          },
        }),
    });
  };

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.topBar}>
          {backButton}

          <View style={styles.topRight}>
            <Text variant="chip" color="primary">
              {ACTIVITY_STEP}/{ACTIVITY_TOTAL}
            </Text>
            <Button
              label="완료"
              // 디자인은 h38 인데 아이가 누르는 버튼이라 48(hitSize.min)인 lg 를 쓴다.
              size="lg"
              disabled={!canFinish}
              loading={submit.isPending}
              onPress={handleDone}
            />
          </View>
        </View>

        <Appear style={styles.stage}>
          {/* 디자인은 위아래 그라디언트다. expo-linear-gradient 를 새로 넣을 만한
              차이가 아니라 밝은 쪽 단색으로 두었다. */}
          <View style={styles.speaker}>
            <GuideFaceIcon width={90} height={90} />
          </View>

          <View style={styles.transcript}>
            {dictation.failure !== null && transcript === '' ? (
              // 받아쓰기가 안 되는 기기·상황. 활동은 계속할 수 있다고 알려준다.
              <Text variant="bodyMedium" color="textMuted">
                {DICTATION_FAILURE_TEXT[dictation.failure]}
              </Text>
            ) : transcript === '' ? (
              <Text variant="bodyMedium" color="textMuted">
                마이크를 누르고 이야기를 들려줘!
              </Text>
            ) : (
              <Text variant="bodyMedium">
                {transcript}
                {recording && '▍'}
              </Text>
            )}
          </View>
        </Appear>

        <View style={styles.micRow}>
          <PressableScale
            accessibilityRole="button"
            accessibilityState={{ selected: recording }}
            accessibilityLabel={recording ? '그만 말하기' : '이야기 말하기'}
            onPress={handleMicPress}
            style={styles.mic}
          >
            <MicIcon width={26} height={26} color={colors.textInverse} />
          </PressableScale>

          {recording && (
            <View style={styles.wave}>
              {WAVE_HEIGHTS.map((height, index) => (
                <View key={index} style={[styles.waveBar, { height }]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.helper}>
          <Text variant="label">이야기 카드와 핵심 단어를 통해 이야기를 다시 말해보자!</Text>

          <View style={styles.helperColumns}>
            <View style={styles.cardColumn}>
              <Text variant="captionStrong">이야기 카드</Text>
              <View style={styles.cardStrip}>
                {orderedCards.map((card, index) => (
                  <OrderCard
                    key={card.sceneId}
                    card={{
                      id: card.sceneId,
                      label: card.title,
                      imageUrl: card.imageUrl ?? undefined,
                    }}
                    order={index + 1}
                    size="sm"
                  />
                ))}
              </View>
            </View>

            <View style={styles.keywordColumn}>
              <Text variant="captionStrong">핵심 단어</Text>
              <View style={styles.keywordRow}>
                {keyWords.map((keyword) => (
                  <Chip key={keyword} label={keyword} size="lg" style={styles.keyword} />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

/** 녹음 중임을 알리는 막대. 높이는 디자인 실측. */
const WAVE_HEIGHTS = [11.34, 18.84, 23.7, 22.72];

/**
 * 받아쓰기가 안 될 때의 안내.
 *
 * 아이가 읽는 문장이라 원인을 설명하지 않고 **다음에 뭘 하면 되는지**만 적는다
 * (디자인에 없는 상태라 문구는 임시다 — 시안이 나오면 교체 대상).
 */
const DICTATION_FAILURE_TEXT: Record<'denied' | 'unavailable' | 'network', string> = {
  denied: '마이크를 쓸 수 없어요. 그래도 소리 내어 말하고 완료를 눌러도 괜찮아!',
  unavailable: '이 기기에서는 글로 옮길 수 없어요. 소리 내어 말하고 완료를 눌러줘!',
  network: '인터넷이 끊겨서 글로 옮길 수 없어요. 소리 내어 말하고 완료를 눌러줘!',
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
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
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  stage: {
    flexDirection: 'row',
    gap: 9, // 디자인 실측
    height: 280, // 디자인 실측
  },
  speaker: {
    width: 175, // 디자인 실측
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAccentWarm,
  },
  transcript: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAccentWarm,
  },
  micRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
    // 마이크는 받아쓰기 판 왼쪽 끝에 맞춰 놓인다 (디자인 실측).
    marginLeft: 184,
  },
  mic: {
    width: 64, // 디자인 실측
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3, // 디자인 실측
    paddingBottom: spacing.md,
  },
  waveBar: {
    width: 4, // 디자인 실측
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  helper: {
    flex: 1,
    gap: spacing.xl,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  helperColumns: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing['3xl'],
  },
  cardColumn: {
    flex: 1,
    gap: 18, // 디자인 실측
  },
  cardStrip: {
    flex: 1,
    flexDirection: 'row',
    gap: 14, // 디자인 실측
    // 카드 왼쪽 위 순번 뱃지가 잘리지 않도록.
    paddingTop: 12,
    paddingLeft: 12,
  },
  keywordColumn: {
    width: 252, // 디자인 실측
    gap: spacing.md,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  keyword: {
    borderRadius: radius.xs, // 디자인 실측 — 활동 화면 칩만 모서리가 작다
  },
});
