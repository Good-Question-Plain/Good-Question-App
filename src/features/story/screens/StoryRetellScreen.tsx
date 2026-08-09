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

import { OrderCard } from '../components/OrderCard';
import { findActivity } from '../model/activity';
import { findStory } from '../model/types';

const ACTIVITY_STEP = 2;
const ACTIVITY_TOTAL = 2;

/**
 * 이야기 후 활동 2/2 — 이야기 다시 말하기 (Figma 92:1290).
 *
 * 아이가 앞에서 맞춘 카드와 핵심 단어를 보면서 이야기를 자기 말로 다시 한다.
 * 받아쓴 글이 화면 한가운데 크게 남는 게 이 활동의 결과물이다.
 */
export function StoryRetellScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = findStory(id);
  const activity = findActivity(id);

  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

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
          <EmptyState
            title="아직 준비 중인 활동이에요"
            description={`${story?.title ?? '이 이야기'}는 곧 활동도 만들 수 있어요`}
          />
        </View>
      </Screen>
    );
  }

  const handleMicPress = (): void => {
    if (recording) {
      setRecording(false);
      return;
    }
    setRecording(true);
    // TODO: STT 연동. 지금은 누르는 즉시 준비된 문장이 받아써진 것으로 친다.
    setTranscript(activity.retellSample);
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
              onPress={() => router.replace({ pathname: '/story/[id]/done', params: { id } })}
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
                  <OrderCard key={card.id} card={card} order={index + 1} size="sm" />
                ))}
              </View>
            </View>

            <View style={styles.keywordColumn}>
              <Text variant="captionStrong">핵심 단어</Text>
              <View style={styles.keywordRow}>
                {activity.keywords.map((keyword) => (
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
