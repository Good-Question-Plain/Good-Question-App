import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

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

import { MicControl } from '../components/MicControl';
import { ScenePanel } from '../components/ScenePanel';
import { CharacterBubble, ChildBubble } from '../components/SpeechBubble';
import { findScript } from '../model/script';
import { findStory } from '../model/types';

/**
 * 장면 나레이션을 읽어주는 데 걸린다고 가정하는 시간.
 *
 * TODO: TTS 를 붙이면 이 타이머 대신 재생 완료 콜백에서 아이 차례로 넘긴다.
 */
const NARRATION_MS = 2500;

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

type Phase = 'narrating' | 'listening';

/**
 * 이야기 전개 및 대화 (Figma 86:410 / 161:1158 / 216:277).
 *
 * 세 개의 시안은 같은 화면의 서로 다른 순간이라 한 화면으로 합쳤다.
 * - `narrating` : 나레이션이 나오는 중. 마이크는 회색이고 누를 수 없다 (86:410)
 * - `listening` : 아이 차례. 마이크에 고리가 생기고 보내기가 나온다 (161:1158)
 * - 미션이 있는 장면이면 줄거리 아래에 미션 패널이 하나 더 붙는다 (216:277)
 */
export function StoryPlayScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = findStory(id);
  const script = findScript(id);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('narrating');
  const [reply, setReply] = useState<string | null>(null);

  const scene = script?.scenes[sceneIndex];

  // 나레이션이 끝나면 아이 차례로 넘어간다. 장면이 바뀌면 `handleSend` 가
  // 다시 'narrating' 으로 돌려놓으므로 여기서 타이머가 새로 걸린다.
  useEffect(() => {
    if (phase !== 'narrating' || scene === undefined) return;

    const timer = setTimeout(() => setPhase('listening'), NARRATION_MS);

    return () => clearTimeout(timer);
  }, [phase, scene]);

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
      // TODO: 이야기 후 활동 화면으로 연결 (디자인 234:562)
      router.back();
      return;
    }
    setSceneIndex((index) => index + 1);
    setPhase('narrating');
    setReply(null);
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

            {phase === 'listening' && (
              <View style={styles.chat}>
                <CharacterBubble speaker={scene.question.speaker} text={scene.question.text} />
                {reply !== null && <ChildBubble text={reply} pending />}
              </View>
            )}

            {scene.mission !== undefined && (
              <ScenePanel badge="미션" text={scene.mission} align="center" />
            )}
          </Appear>
        </ScrollView>

        <View style={styles.micArea}>
          <MicControl
            state={phase === 'narrating' ? 'waiting' : 'listening'}
            // TODO: STT 연동. 지금은 누르면 대본에 적힌 예시 답변이 대신 나온다.
            onPress={() => setReply(scene.sampleReply)}
          />
          {phase === 'listening' && (
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
  send: {
    width: 159, // 디자인 실측
    // Button 의 기본값이 flex-start 라 부모의 alignItems 만으로는 가운데로 오지 않는다.
    alignSelf: 'center',
  },
});
