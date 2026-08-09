import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, radius, spacing, storyTints } from '@/shared/theme';
import {
  Appear,
  ArrowLeftIcon,
  Button,
  Chip,
  EmptyState,
  PressableScale,
  Screen,
  Text,
} from '@/shared/ui';

import { findStory, MOCK_STORIES } from '../model/types';

/**
 * 이야기 상세 (Figma 125:236).
 *
 * 왼쪽에 큰 썸네일, 오른쪽에 태그·제목·줄거리·역할 안내·정보·시작 버튼.
 * 태블릿 가로를 살린 2단 구성이라 좁은 폭에서는 세로로 쌓는다.
 */
export function StoryDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = findStory(id);

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
        <ArrowLeftIcon width={26} height={15} color={colors.text} />
        <Text variant="body">뒤로</Text>
      </PressableScale>
    </Appear>
  );

  // 없는 id 로 들어온 경우(오래된 링크, 삭제된 이야기)에 다른 이야기를 대신
  // 보여주면 사용자는 그게 맞는 줄 안다. 못 찾았다는 사실을 그대로 알린다.
  if (story === undefined) {
    return (
      <Screen>
        <View style={styles.page}>
          {backButton}
          <EmptyState
            title="이야기를 찾을 수 없어요"
            description="사라졌거나 주소가 바뀐 이야기예요"
          />
        </View>
      </Screen>
    );
  }

  const { title, minutes, tag, Icon, tags, summary, roleGuide, characters } = story;
  const tintIndex = MOCK_STORIES.findIndex((item) => item.id === story.id);

  return (
    <Screen>
      <View style={styles.page}>
        {backButton}

        <ScrollView contentContainerStyle={styles.bodyScroll}>
          <View style={styles.body}>
            <Appear style={styles.thumbnailWrap}>
              <View
                style={[
                  styles.thumbnail,
                  { backgroundColor: storyTints[tintIndex % storyTints.length] },
                ]}
              >
                <Icon width={220} height={220} />
              </View>
            </Appear>

            <Appear delay={60} style={styles.info}>
              <View style={styles.tags}>
                {(tags ?? [tag]).map((item) => (
                  <Chip key={item} label={item} size="sm" />
                ))}
              </View>

              <Text variant="word">{title}</Text>

              {summary !== undefined && (
                <Text variant="body" color="textStrong" style={styles.summary}>
                  {summary}
                </Text>
              )}

              {roleGuide !== undefined && (
                <View style={styles.roleCard}>
                  <Text variant="captionStrong" color="primaryText">
                    너는 이 이야기에서...
                  </Text>
                  <Text variant="body">{roleGuide}</Text>
                </View>
              )}

              <View style={styles.meta}>
                <MetaRow label="예상 시간" value={`약 ${minutes}분`} />
                {characters !== undefined && (
                  <MetaRow label="등장 인물" value={characters.join(', ')} />
                )}
              </View>

              <Button
                label="시작하기"
                fullWidth
                size="lg"
                style={styles.cta}
                onPress={() =>
                  router.push({ pathname: '/story/[id]/play', params: { id: story.id } })
                }
              />
            </Appear>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

function MetaRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.metaRow}>
      <Text variant="captionStrong">{label}</Text>
      <Text variant="caption" color="textStrong" style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  bodyScroll: {
    paddingBottom: spacing.xl,
  },
  body: {
    flexDirection: 'row',
    gap: spacing['3xl'],
  },
  thumbnailWrap: {
    flex: 1.2,
  },
  thumbnail: {
    height: 402, // 디자인 실측
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16, // 디자인 실측
  },
  info: {
    flex: 1,
    gap: spacing['2xl'],
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summary: {
    lineHeight: 22.5, // 디자인 실측
  },
  roleCard: {
    gap: spacing.xs,
    padding: 14, // 디자인 실측
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAccentWarm,
  },
  meta: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaValue: {
    flex: 1,
  },
  cta: {
    marginTop: spacing.md,
  },
});
