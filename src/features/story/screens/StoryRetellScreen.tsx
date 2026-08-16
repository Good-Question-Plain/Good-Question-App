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
import { useChildRecorder } from '../hooks/useChildRecorder';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const storyId = id ?? '';

  const { data: progress } = useStoryProgress(childId, storyId);
  const sessionId = progress?.sessionId ?? '';
  const { data: activity } = usePostActivity(sessionId);
  const submit = useSubmitRetelling(sessionId);
  const recorder = useChildRecorder();

  /**
   * 받아쓴 글.
   *
   * **아직 채울 방법이 없다.** `POST .../retell` 은 완성된 텍스트를 받는데,
   * 아이 음성을 글로 바꿔줄 엔드포인트가 명세에 없다 (대화의 `speak` 는 장면에
   * 묶여 있어 여기서 못 쓴다). 녹음은 해두고, STT 가 생기면 그 결과를 여기에
   * 넣으면 화면 나머지는 그대로 동작한다. **백엔드 확인 대상.**
   */
  const [transcript] = useState('');
  /** 한 번이라도 말했는지. 완료 버튼을 열어주는 조건이다. */
  const [spoke, setSpoke] = useState(false);
  const recording = recorder.isRecording;

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
   * 마이크.
   *
   * **받아쓴 글이 아직 화면에 안 나온다.** `POST .../retell` 은 완성된 텍스트를
   * 받는데, 아이 음성을 글로 바꿔줄 엔드포인트가 명세에 없다
   * (대화의 `speak` 는 장면에 묶여 있어 여기서 못 쓴다).
   * 녹음은 해두고, 서버에 STT 가 생기면 그 결과를 `transcript` 에 넣으면 된다.
   */
  const handleMicPress = (): void => {
    if (recording) {
      void recorder.stop().then(() => setSpoke(true));
      return;
    }
    void recorder.start();
  };

  const handleDone = (): void => {
    if (submit.isPending) return;

    submit.mutate(transcript, {
      onSuccess: () => router.replace({ pathname: '/story/[id]/done', params: { id: storyId } }),
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
              disabled={!spoke}
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
            {transcript === '' ? (
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
                {activity.cards.map((card, index) => (
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
                {/* 핵심 단어는 정답을 맞힐 때 서버가 준다. 여기서는 카드 제목을
                    대신 늘어놓는다 — 활동 화면에서 방금 본 것과 같은 말들이다. */}
                {activity.cards
                  .map((card) => card.title)
                  .map((keyword) => (
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
