import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { colors, hitSize, hitSlopFor, radius, spacing } from '@/shared/theme';
import {
  Appear,
  ArrowLeftIcon,
  Button,
  EmptyState,
  PressableScale,
  Screen,
  Text,
} from '@/shared/ui';

import { MicControl, type MicState } from '../components/MicControl';
import { ScenePanel } from '../components/ScenePanel';
import { CharacterBubble, ChildBubble, ListeningHint } from '../components/SpeechBubble';
import { findScript } from '../model/script';
import { findStory } from '../model/types';

/**
 * 장면 나레이션을 읽어주는 데 걸린다고 가정하는 시간.
 *
 * TODO: TTS 를 붙이면 이 타이머 대신 재생 완료 콜백에서 아이 차례로 넘긴다.
 */
const NARRATION_MS = 2500;

/**
 * 아이 말을 받아 적는 데 걸린다고 가정하는 시간.
 *
 * TODO: STT 를 붙이면 인식 완료 콜백으로 바꾼다.
 */
const TRANSCRIBE_MS = 900;

/**
 * 배경 그림 위에 글을 얹으려면 그림을 죽여야 한다. 디자인 실측(40%).
 * 그림 자체를 어둡게 만들지 않고 흰 배경 위에서 투명도만 낮춘다.
 */
const BACKDROP_OPACITY = 0.4;

/**
 * TODO: 장면 배경은 서버가 장면마다 내려줄 값이다. 지금은 디자인에 들어 있던
 * 한옥 마당 그림 하나를 모든 장면에 쓴다.
 */
const SCENE_BACKGROUND = require('@assets/scenes/hanok-yard.jpg') as number;

/**
 * 이야기 전개 및 대화 (Figma 86:410 / 161:1158 / 216:277).
 *
 * 여러 시안이 같은 화면의 서로 다른 순간이라 한 화면으로 합쳤다. 마이크 상태는
 * 디자인의 가이드 프레임(86:448)이 정의한 네 가지를 그대로 따른다.
 *
 * 나레이션 재생(`blocked`) → 아이 차례(`ready`) → 녹음(`listening`)
 * → 받아쓰기(`processing`) → 답변 확정 후 다시 `ready`, 보내기 활성.
 *
 * 미션이 있는 장면이면 줄거리 아래에 미션 패널이 하나 더 붙는다 (216:277).
 */
export function StoryPlayScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = findStory(id);
  const script = findScript(id);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [micState, setMicState] = useState<MicState>('blocked');
  const [reply, setReply] = useState<string | null>(null);

  const scene = script?.scenes[sceneIndex];

  // 나레이션이 끝나면 아이 차례로 넘어간다. 장면이 바뀌면 `handleSend` 가
  // 다시 'blocked' 로 돌려놓으므로 여기서 타이머가 새로 걸린다.
  useEffect(() => {
    if (micState !== 'blocked' || scene === undefined) return;

    const timer = setTimeout(() => setMicState('ready'), NARRATION_MS);

    return () => clearTimeout(timer);
  }, [micState, scene]);

  // 녹음을 멈추면 받아쓴 결과가 도착한다.
  useEffect(() => {
    if (micState !== 'processing' || scene === undefined) return;

    const timer = setTimeout(() => {
      setReply(scene.sampleReply);
      setMicState('ready');
    }, TRANSCRIBE_MS);

    return () => clearTimeout(timer);
  }, [micState, scene]);

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
        {story?.title ?? '이야기'}
      </Text>
    </PressableScale>
  );

  // 대본이 아직 없는 이야기로 들어온 경우. 목데이터에는 한 편만 준비돼 있다.
  if (script === undefined || scene === undefined) {
    return (
      <Screen>
        <View style={styles.page}>
          {backButton}
          <EmptyState
            title="아직 준비 중인 이야기예요"
            description="곧 이 이야기로도 대화할 수 있어요"
          />
        </View>
      </Screen>
    );
  }

  const total = script.scenes.length;
  const isLastScene = sceneIndex === total - 1;

  const handleSend = (): void => {
    if (isLastScene) {
      router.replace({ pathname: '/story/[id]/activity', params: { id } });
      return;
    }
    setSceneIndex((index) => index + 1);
    setMicState('blocked');
    setReply(null);
  };

  /** 마이크는 아이 차례일 때 녹음을 시작하고, 녹음 중이면 멈춘다. */
  const handleMicPress = (): void => {
    if (micState === 'ready') {
      setReply(null);
      setMicState('listening');
      return;
    }
    if (micState === 'listening') setMicState('processing');
  };

  return (
    <Screen
      padded={false}
      maxContentWidth={null}
      backdrop={
        <Image
          source={SCENE_BACKGROUND}
          resizeMode="cover"
          style={styles.backdrop}
          accessibilityIgnoresInvertColors
        />
      }
    >
      <View style={styles.page}>
        <View style={styles.topBar}>
          {backButton}
          <View style={styles.progress}>
            <Text variant="captionSmallStrong" color="textStrong">
              {sceneIndex + 1}/{total}
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: total, now: sceneIndex + 1 }}
              style={styles.progressTrack}
            >
              <View
                style={[styles.progressFill, { width: `${((sceneIndex + 1) / total) * 100}%` }]}
              />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.bodyScroll}>
          {/* 장면이 바뀌면 패널이 새로 나타나야 아이가 "넘어갔다"를 안다. */}
          <Appear key={sceneIndex} style={styles.body}>
            <ScenePanel
              badge={scene.mission === undefined ? '이야기 줄거리' : '이야기 상황'}
              text={scene.narration}
              onReplay={() => {
                // TODO: TTS 재생
              }}
            />

            {micState !== 'blocked' && (
              <View style={styles.chat}>
                <CharacterBubble speaker={scene.question.speaker} text={scene.question.text} />
                {micState === 'listening' && <ListeningHint />}
                {reply !== null && <ChildBubble text={reply} />}
              </View>
            )}

            {scene.mission !== undefined && (
              <ScenePanel badge="미션" text={scene.mission} align="center" />
            )}
          </Appear>
        </ScrollView>

        <View style={styles.micArea}>
          <MicControl state={micState} onPress={handleMicPress} />

          {/* 보내기는 아이 차례에만 나오지만(디자인 86:410 엔 없다) 자리는 늘 비워둔다.
              버튼이 생겼다 사라지면 그 위의 마이크가 손가락 밑에서 위아래로 움직인다. */}
          <View style={styles.sendSlot}>
            {micState !== 'blocked' && (
              <Button
                label={isLastScene ? '마치기' : '보내기'}
                // 디자인은 h42 지만 아이 손가락이 닿는 버튼이라 48(hitSize.min)인 lg 를 쓴다.
                size="lg"
                disabled={reply === null}
                style={styles.send}
                onPress={handleSend}
              />
            )}
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
    paddingBottom: spacing.lg,
  },
  backdrop: {
    width: '100%',
    height: '100%',
    opacity: BACKDROP_OPACITY,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xl,
    paddingHorizontal: spacing['3xl'], // 디자인 실측(24)
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 디자인 실측
    flexShrink: 1,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressTrack: {
    width: 140, // 디자인 실측
    height: 6, // 디자인 실측
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  bodyScroll: {
    flexGrow: 1,
  },
  body: {
    gap: spacing.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: 40, // 디자인 실측
  },
  chat: {
    gap: spacing.md,
  },
  micArea: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  sendSlot: {
    height: hitSize.min, // 보내기 버튼(lg) 높이
    justifyContent: 'center',
  },
  send: {
    width: 159, // 디자인 실측
    // Button 의 기본값이 flex-start 라 부모의 alignItems 만으로는 가운데로 오지 않는다.
    alignSelf: 'center',
  },
});
