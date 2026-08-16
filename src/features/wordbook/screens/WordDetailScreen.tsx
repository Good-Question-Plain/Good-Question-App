import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import {
  Appear,
  ArrowLeftIcon,
  EmptyState,
  HeartDetailIcon,
  PressableScale,
  Screen,
  SpeakerIcon,
  Text,
} from '@/shared/ui';

import { useToggleWordSaved, useWordDetail } from '../api/queries';

export interface WordDetailScreenProps {
  /** `GET /vocabulary/{id}` 가 `child_id` 를 필수로 받는다. 라우트가 넘긴다. */
  childId: string;
}

/**
 * 단어 상세 (Figma 118:174).
 *
 * 아이가 이야기 중 저장한 단어를 다시 보는 화면. 아직 글을 빠르게 읽지 못하므로
 * 단어를 크게(32) 놓고 듣기 버튼을 바로 옆에 둔다.
 * 설명은 "뜻 → 언제 쓰는지 → 이야기에서 어떻게 나왔는지" 순으로 좁혀간다.
 */
export function WordDetailScreen({ childId }: WordDetailScreenProps): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading } = useWordDetail(childId, id ?? '');
  const toggleSaved = useToggleWordSaved(childId);
  const saved = entry?.saved ?? false;

  const backButton = (
    <Appear>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="뒤로"
        onPress={() => router.back()}
        scaleTo={0.94}
        hitSlop={hitSlopFor(24)}
        style={styles.backButton}
      >
        <ArrowLeftIcon width={26} height={15} color={colors.textMuted} />
        <Text variant="body" color="textMuted">
          {entry === undefined ? '뒤로' : `${entry.storyTitle}에서 만난 단어`}
        </Text>
      </PressableScale>
    </Appear>
  );

  if (entry === undefined) {
    return (
      <Screen>
        <View style={styles.page}>
          {backButton}
          {/* 받아오는 중에는 "없어요"를 띄우지 않는다 — 잠깐 떴다 사라지면
              지워진 줄 안다. 자리만 비워 두고 기다린다. */}
          {!isLoading && (
            <EmptyState title="단어를 찾을 수 없어요" description="저장이 지워졌을 수 있어요" />
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        {backButton}

        <ScrollView contentContainerStyle={styles.bodyScroll}>
          <Appear delay={60} style={styles.body}>
            <View style={styles.wordRow}>
              <Text variant="display" color="primaryTextDeep">
                {entry.word}
              </Text>

              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="단어 듣기"
                scaleTo={0.88}
                hitSlop={hitSlopFor(ROUND_BUTTON_SIZE)}
                style={[styles.roundButton, styles.speakerButton]}
                /**
                 * 단어를 소리 내어 읽어준다. **TTS 는 앱이 맡는다.**
                 * 서버가 `audio_url` 을 줄 때는 그 녹음을 재생하는 게 맞지만,
                 * 지금은 값이 비어 오므로 기기 음성으로 읽는다.
                 */
                onPress={() => {
                  Speech.stop();
                  Speech.speak(entry.word, { language: 'ko-KR', rate: 0.9 });
                }}
              >
                <SpeakerIcon width={18} height={18} color={colors.textInverse} />
              </PressableScale>

              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={saved ? '저장 해제' : '저장'}
                accessibilityState={{ selected: saved }}
                scaleTo={0.88}
                hitSlop={hitSlopFor(ROUND_BUTTON_SIZE)}
                style={[styles.roundButton, styles.saveButton]}
                onPress={() => toggleSaved.mutate({ vocabId: entry.id, saved: !saved })}
              >
                <HeartDetailIcon
                  width={18}
                  height={18}
                  color={saved ? colors.primary : colors.borderStrong}
                />
              </PressableScale>
            </View>

            <Section title="이 단어는 이런 뜻이에요" body={entry.meaning} />
            <Section title="언제 쓰는 말이에요?" body={entry.usage} tone="textStrong" />

            <View style={styles.section}>
              <Text variant="subheading" color="primaryText">
                이야기에서는 이렇게 나왔어요
              </Text>
              <View style={styles.quote}>
                <Text variant="body">&ldquo;{entry.quote}&rdquo;</Text>
              </View>
            </View>
          </Appear>
        </ScrollView>
      </View>
    </Screen>
  );
}

function Section({
  title,
  body,
  tone = 'text',
}: {
  title: string;
  body: string;
  tone?: 'text' | 'textStrong';
}): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text variant="subheading" color="primaryText">
        {title}
      </Text>
      <Text variant="body" color={tone} style={styles.sectionBody}>
        {body}
      </Text>
    </View>
  );
}

/** 디자인 실측. 48dp 보다 작아서 hitSlop 으로 터치 영역만 넓힌다. */
const ROUND_BUTTON_SIZE = 40;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: 30, // 디자인 실측
    paddingTop: spacing['3xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  bodyScroll: {
    paddingBottom: spacing.xl,
  },
  body: {
    gap: spacing['2xl'],
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13, // 디자인 실측
  },
  roundButton: {
    width: ROUND_BUTTON_SIZE,
    height: ROUND_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  speakerButton: {
    backgroundColor: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primarySelected,
  },
  section: {
    gap: spacing.md,
  },
  sectionBody: {
    lineHeight: 28.8, // 디자인 실측
  },
  quote: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    borderLeftWidth: 4, // 디자인 실측
    borderLeftColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAccentWarm,
  },
});
