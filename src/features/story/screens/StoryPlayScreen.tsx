import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { toApiError } from '@/shared/api';
import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import {
  Appear,
  ArrowLeftIcon,
  Button,
  EmptyState,
  PressableScale,
  Screen,
  Text,
} from '@/shared/ui';

import type { SceneVocabulary, SessionStep } from '../api/progressApi';
import {
  useCompleteStep,
  useEnterStep,
  useSelectSceneVocabulary,
  useSpeak,
  useStartStorySession,
} from '../api/queries';
import { MicControl, type MicState } from '../components/MicControl';
import { NarrationPanel } from '../components/NarrationPanel';
import { ScenePanel } from '../components/ScenePanel';
import { SceneWordPicker } from '../components/SceneWordPicker';
import { CharacterBubble, ChildBubble, ListeningHint } from '../components/SpeechBubble';
import { useChildRecorder } from '../hooks/useChildRecorder';
import { useNarrationSpeech } from '../hooks/useNarrationSpeech';

/**
 * 읽어주기가 **시작조차 못 했는지** 판단하는 시간.
 *
 * 기기에 한국어 음성이 없거나 엔진이 죽어 있으면 `onDone` 도 `onError` 도 안 오는
 * 경우가 있다. 읽어주는 동안에는 화면에 누를 것이 하나도 없으므로(디자인 380:342),
 * 그대로 두면 **아이가 아무 버튼도 없는 화면에 갇힌다.**
 *
 * 이 시간 뒤에도 소리가 시작되지 않았으면 읽기를 포기하고 다음으로 넘긴다.
 */
const SPEECH_START_TIMEOUT_MS = 3000;

/**
 * 읽어주기가 시작은 했는데 **끝났다는 신호가 안 올 때**의 최후 상한.
 *
 * 글자 수에 비례해 잡는다 — 짧은 대사에 30초를 기다리면 멈춘 것처럼 보이고,
 * 긴 나레이션에 고정 몇 초를 주면 읽는 도중에 버튼이 튀어나온다.
 * (예전에 2.5초 고정이었는데, 15초짜리 나레이션 중간에 넘어가 버렸다.)
 */
function speechDeadlineMs(text: string): number {
  // 한국어 TTS 가 대략 초당 5~6자다. 넉넉히 잡고 시작 지연까지 더한다.
  return 8000 + text.length * 400;
}

/**
 * 배경 그림 위에 글을 얹으려면 그림을 죽여야 한다. 디자인 실측(40%).
 * 그림 자체를 어둡게 만들지 않고 흰 배경 위에서 투명도만 낮춘다.
 */
const BACKDROP_OPACITY = 0.4;

/** 서버가 장면 그림을 안 줄 때 쓰는 기본 배경 (디자인에 들어 있던 한옥 마당). */
const FALLBACK_BACKGROUND = require('@assets/scenes/hanok-yard.jpg') as number;

export interface StoryPlayScreenProps {
  childId: string;
  /** 뒤로 버튼에 쓸 이야기 제목. 세션 응답에는 제목이 없어 라우트가 넘긴다. */
  storyTitle?: string;
}

/**
 * 이야기 전개 및 대화 (Figma 380:342 / 161:1158 / 380:281).
 *
 * 여러 시안이 같은 화면의 서로 다른 순간이라 한 화면으로 합쳤다. 마이크 상태는
 * 디자인의 가이드 프레임(86:448)이 정의한 네 가지를 그대로 따른다.
 *
 * **장면은 서버가 굴린다.** `POST /progress/{story_id}/start` 로 세션을 열고,
 * 나레이션은 `complete` 로, 대화는 `speak` 로 넘어간다. 다음 장면으로 갈지도
 * 서버가 정한다(`scene_ended`) — 앱이 세지 않는다.
 *
 * **미션은 `kind` 가 아니다.** 미션이 있는 장면도 `kind` 는 `dialogue` 이고,
 * 아이가 말한 뒤 `speak` 응답에 `mission` 이 붙어야 미션 패널이 나온다.
 */
export function StoryPlayScreen({ childId, storyTitle }: StoryPlayScreenProps): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const storyId = id ?? '';

  const [step, setStep] = useState<SessionStep | null>(null);
  /**
   * 지금 읽어주는 중인지.
   *
   * **마이크 상태와 분리해서 들고 있다.** 예전에는 `micState = 'blocked'` 하나로
   * "읽어주는 중"까지 표현했는데, 디자인의 마이크 가이드(86:448)는 상태를 **3개**
   * (준비 완료 · 듣고 있어요 · 정리 중)만 정의하고 나레이션 시안(380:342)에는
   * 마이크가 아예 없다. 읽어주는 동안은 마이크가 존재하지 않는 시간이라
   * 마이크의 한 상태로 표현하면 안 된다.
   */
  const [isReading, setIsReading] = useState(true);
  const [micState, setMicState] = useState<MicState>('ready');
  const [reply, setReply] = useState<string | null>(null);
  /** 등장인물의 답. `speak` 응답으로 갱신되며, 장면이 끝나면 마무리 대사가 된다. */
  const [characterLine, setCharacterLine] = useState<string | null>(null);
  const [sceneEnded, setSceneEnded] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  /**
   * 단어 목록을 펼쳤는지. 시안은 접힌 상태가 기본이다.
   *
   * 장면이 바뀌면 단어도 바뀌므로 다시 접는다 — 펼친 채로 두면 이전 장면의
   * 길이만큼 그림을 가린 채 새 단어가 들어온다.
   */
  const [wordsExpanded, setWordsExpanded] = useState(false);

  const start = useStartStorySession(childId);
  const enterStep = useEnterStep(childId);
  const completeStep = useCompleteStep(childId);
  const speak = useSpeak(childId);
  const selectWord = useSelectSceneVocabulary(childId);
  const recorder = useChildRecorder();
  const speech = useNarrationSpeech();

  // 화면에 들어오면 세션을 연다. 같은 이야기를 이미 보던 중이면 이어하기가 된다.
  useEffect(() => {
    if (childId.length === 0 || storyId.length === 0) return;

    start.mutate(storyId, {
      onSuccess: (session) => setStep(session.step),
      onError: (error) => {
        const apiError = toApiError(error);
        // 409 = 다른 이야기가 진행 중. 아이당 세션은 하나뿐이다.
        setFailure(
          apiError.kind === 'conflict'
            ? '읽던 다른 이야기가 있어요. 그 이야기를 먼저 끝내주세요.'
            : '이야기를 열지 못했어요. 잠시 후 다시 시도해주세요.',
        );
      },
    });
    // 세션 열기는 화면당 한 번이다. mutate 는 매 렌더 새 참조라 의존성에 넣지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, storyId]);

  /**
   * 장면이 바뀌면 읽어주고, 다 읽으면 아이 차례로 넘긴다.
   *
   * **TTS 는 앱이 맡는다** — 서버는 글만 준다. 읽어주는 동안 화면에는 누를 것이
   * 하나도 없으므로(디자인 380:342), 읽기가 조용히 실패하면 아이가 갇힌다.
   * 그래서 안전장치를 **두 겹**으로 건다.
   *
   * 1. 소리가 시작조차 안 되면 (`SPEECH_START_TIMEOUT_MS`)
   * 2. 시작은 했는데 끝났다는 신호가 안 오면 (`speechDeadlineMs`)
   */
  useEffect(() => {
    if (step === null || !isReading) return;

    // 대화 장면이면 등장인물의 첫 대사를, 아니면 줄거리를 읽는다.
    const line = step.kind === 'narration' ? step.sceneDescription : (step.characterOpening ?? '');

    speech.speak(line, () => setIsReading(false));

    const deadline = setTimeout(() => setIsReading(false), speechDeadlineMs(line));

    return () => clearTimeout(deadline);
    // speech 는 매 렌더 같은 참조라 의존성에 넣으면 무한 재생된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isReading]);

  /**
   * 읽어주기가 **시작조차 못 한** 경우를 건져낸다.
   *
   * 소리가 나기 시작하면 이 효과가 다시 돌면서 타이머를 걷어간다 — 그러면 끝까지
   * 기다린다. 여기서 성급하게 넘기면 읽는 도중에 버튼이 튀어나온다.
   */
  useEffect(() => {
    if (!isReading || speech.isSpeaking) return;

    const timer = setTimeout(() => setIsReading(false), SPEECH_START_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isReading, speech.isSpeaking]);

  const backButton = (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="이야기 그만두기"
      onPress={() => router.back()}
      scaleTo={0.94}
      hitSlop={hitSlopFor(24)}
      style={styles.backButton}
    >
      <ArrowLeftIcon width={26} height={15} color={colors.text} />
      <Text variant="labelSmall" numberOfLines={1}>
        {storyTitle ?? '이야기'}
      </Text>
    </PressableScale>
  );

  if (failure !== null || step === null) {
    return (
      <Screen>
        <View style={styles.page}>
          {backButton}
          <EmptyState
            title={failure ?? '이야기를 준비하고 있어요'}
            description={failure === null ? '잠시만 기다려주세요' : undefined}
          />
        </View>
      </Screen>
    );
  }

  const total = step.sceneCount;
  const current = step.stepIndex;
  const isNarration = step.kind === 'narration';
  const isLastScene = current >= total;

  /** 다음 장면으로. 마지막이면 이야기 후 활동으로 넘어간다. */
  const goNextScene = (): void => {
    if (isLastScene) {
      router.replace({ pathname: '/story/[id]/activity', params: { id: storyId } });
      return;
    }

    enterStep.mutate(
      { storyId, stepIndex: current + 1 },
      {
        onSuccess: (next) => {
          setStep(next);
          // 새 장면은 읽어주기부터 시작한다. 마이크는 다 읽은 뒤에야 나타난다.
          setIsReading(true);
          setMicState('ready');
          setReply(null);
          setCharacterLine(null);
          setSceneEnded(false);
          // 새 장면의 단어는 접힌 채로 시작한다.
          setWordsExpanded(false);
        },
      },
    );
  };

  /**
   * "보내기" — 나레이션이면 완료 처리, 대화면 장면이 끝난 뒤에만 넘어간다.
   */
  const handleSend = (): void => {
    if (isNarration) {
      completeStep.mutate(
        { storyId, stepIndex: current },
        {
          onSuccess: (progress) => {
            if (progress.completed) {
              router.replace({ pathname: '/story/[id]/activity', params: { id: storyId } });
              return;
            }
            goNextScene();
          },
        },
      );
      return;
    }

    goNextScene();
  };

  /** 마이크는 아이 차례일 때 녹음을 시작하고, 녹음 중이면 멈춰서 서버로 보낸다. */
  const handleMicPress = (): void => {
    // 장면이 끝난 뒤에는 서버가 발화를 받지 않는다("이 장면에서는 말할 수 없습니다").
    // 눌러도 400 만 받고 아이에게는 아무 일도 안 일어난 것처럼 보이므로 여기서 막는다.
    if (sceneEnded) return;

    if (micState === 'ready') {
      // 등장인물의 대답을 읽어주는 중이면 멈춘다. 아이 목소리와 겹쳐 녹음되면 안 된다.
      speech.stop();
      setReply(null);
      setMicState('listening');
      void recorder.start();
      return;
    }

    if (micState !== 'listening') return;

    setMicState('processing');
    void (async () => {
      const audio = await recorder.stop();
      if (audio === null) {
        setMicState('ready');
        return;
      }

      speak.mutate(
        { storyId, stepIndex: current, audio },
        {
          onSuccess: (result) => {
            setReply(result.childText.length > 0 ? result.childText : null);
            setCharacterLine(result.characterLine);
            // 등장인물의 대답도 읽어준다. 아이가 글을 못 읽어도 대화가 이어진다.
            if (result.characterLine !== null) speech.speak(result.characterLine);
            setSceneEnded(result.sceneEnded);
            // 미션은 대화가 진행돼야 나온다. 응답에 붙어 오면 패널이 생긴다.
            setStep((prev) =>
              prev === null ? prev : { ...prev, mission: result.mission, turn: result.turn },
            );
            setMicState('ready');
          },
          onError: () => setMicState('ready'),
        },
      );
    })();
  };

  const handleToggleWord = (word: SceneVocabulary): void => {
    selectWord.mutate(
      { storyId, stepIndex: current, sceneVocabularyId: word.id, selected: !word.selected },
      {
        onSuccess: (words) =>
          setStep((prev) => (prev === null ? prev : { ...prev, vocabularies: words })),
      },
    );
  };

  // 대화 장면은 서버가 끝났다고 해야 넘어갈 수 있다. 나레이션은 다 읽으면 바로다.
  const canSend = isNarration ? !isReading : sceneEnded;

  return (
    <Screen padded={false} maxContentWidth={null}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          {backButton}
          <View style={styles.progress}>
            <Text variant="captionSmallStrong" color="textStrong">
              {current}/{total}
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: total, now: current }}
              style={styles.progressTrack}
            >
              <View style={[styles.progressFill, { width: `${(current / total) * 100}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* 왼쪽: 줄거리. 장면이 바뀌면 새로 나타나야 아이가 "넘어갔다"를 안다. */}
          <Appear key={current} style={styles.narrationColumn}>
            <NarrationPanel
              badge={step.mission === null ? '이야기 줄거리' : '이야기 상황'}
              text={step.sceneDescription}
              // 읽는 도중에 누르면 원래 재생이 `stop()` 으로 끊겨 완료 콜백이 오지
              // 않는다. 다시 듣기도 끝나면 같은 신호를 줘야 버튼이 나타난다.
              onReplay={() => speech.speak(step.sceneDescription, () => setIsReading(false))}
            />
          </Appear>

          {/* 오른쪽: 배경 그림 위에 대화와 마이크가 얹힌다. */}
          <View style={styles.sceneColumn}>
            <Image
              // `imageUrl` 은 `toRemoteImageUri` 를 통과한 값이라, 받아올 수 없는
              // 객체 키가 오면 여기서 null 이 되어 번들 그림으로 떨어진다.
              source={step.imageUrl === null ? FALLBACK_BACKGROUND : { uri: step.imageUrl }}
              resizeMode="cover"
              style={styles.backdrop}
              accessibilityIgnoresInvertColors
            />

            {/* 단어 고르기는 그림 오른쪽 위에 겹친다 (디자인 실측: 오른쪽 19 · 위 11). */}
            <View style={styles.wordPicker}>
              <SceneWordPicker
                words={step.vocabularies}
                onToggle={handleToggleWord}
                expanded={wordsExpanded}
                onToggleExpanded={() => setWordsExpanded((prev) => !prev)}
                disabled={selectWord.isPending}
              />
            </View>

            {/* 말풍선은 **읽어주는 동안에도** 보인다 (시안 161:1158). 소리만 나고
                글이 없으면 아이가 무슨 말인지 따라갈 수가 없다. */}
            {step.characterName !== null && (
              <View style={styles.chat}>
                <CharacterBubble
                  speaker={step.characterName}
                  text={characterLine ?? step.characterOpening ?? ''}
                />
                {micState === 'listening' && !isReading && <ListeningHint />}
                {reply !== null && <ChildBubble text={reply} />}
              </View>
            )}

            {/* 미션과 마이크는 한 덩어리로 아래에 붙는다 (디자인 실측: 바닥에서 23). */}
            <View style={styles.bottomStack}>
              {step.mission !== null && (
                <ScenePanel badge="미션" text={step.mission.condition} align="center" />
              )}

              <View style={styles.micArea}>
                {/*
                  읽어주는 동안에는 마이크도 보내기도 없다 (나레이션 시안 380:342).
                  **"화면에 뭔가 나타나면 내 차례"** 가 이 화면의 유일한 신호다 —
                  회색 마이크를 계속 띄워두면 언제가 자기 차례인지 알 수가 없다.

                  마이크는 대화 장면에만 있다. 나레이션 장면은 서버가 발화를 받지
                  않으므로(`speak` 가 400) 보내기만 나온다.
                */}
                {!isReading && !isNarration && (
                  <MicControl state={micState} onPress={handleMicPress} />
                )}

                {/* 보내기는 자리를 늘 비워둔다 — 생겼다 사라지면 위의 마이크가 움직인다. */}
                <View style={styles.sendSlot}>
                  {!isReading && (
                    <Button
                      label={isLastScene ? '마치기' : '보내기'}
                      // 디자인은 h42 지만 아이 손가락이 닿는 버튼이라 48(hitSize.min)인 lg 를 쓴다.
                      size="lg"
                      disabled={!canSend}
                      loading={completeStep.isPending || enterStep.isPending}
                      style={styles.send}
                      onPress={handleSend}
                    />
                  )}
                </View>
              </View>

              {recorder.isDenied && (
                <Text variant="captionSmall" color="danger" style={styles.micNotice}>
                  마이크를 쓸 수 없어요. 설정에서 허용해주세요.
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 22, // 디자인 실측
  },
  // 왼쪽 457 : 오른쪽 539, 사이 13. 실측값을 flex 에 그대로 넣어 비율을 지킨다.
  // 오른쪽 열은 화면 오른쪽·아래 끝에 붙으므로 페이지에 오른쪽 여백을 주지 않는다.
  body: {
    flex: 1,
    flexDirection: 'row',
    gap: 13, // 디자인 실측
    paddingLeft: spacing['3xl'],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    width: 120, // 디자인 실측
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  narrationColumn: {
    flex: 457, // 디자인 실측
    gap: spacing.xl,
  },
  sceneColumn: {
    flex: 539, // 디자인 실측
    justifyContent: 'flex-end',
    borderTopLeftRadius: radius.lg,
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: BACKDROP_OPACITY,
  },
  // 그림 위에 겹쳐 놓는다. 실측: 그림(539×687) 기준 오른쪽 19 · 위 11.
  wordPicker: {
    position: 'absolute',
    top: 11,
    right: 19,
    // 대화 말풍선이 이 자리로 올라와도 단어 상자가 위에 있어야 누를 수 있다.
    zIndex: 1,
  },
  chat: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  bottomStack: {
    marginTop: 'auto',
    gap: spacing.md, // 디자인 실측 (미션 → 마이크 10)
    paddingBottom: 23, // 디자인 실측
    paddingHorizontal: spacing.xl,
  },
  micArea: {
    alignItems: 'center',
    gap: spacing.md,
  },
  sendSlot: {
    height: 48, // Button size="lg" 높이. 버튼이 없을 때도 자리를 비워둔다.
    justifyContent: 'center',
  },
  send: {
    paddingHorizontal: spacing['4xl'],
  },
  micNotice: {
    textAlign: 'center',
  },
});
