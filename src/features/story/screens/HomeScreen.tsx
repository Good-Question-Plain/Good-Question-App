import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useResponsive } from '@/shared/hooks/useResponsive';
import { spacing } from '@/shared/theme';
import { Appear, ChildSwitcher, EmptyState, Screen, Text } from '@/shared/ui';

import { ContinueCard } from '../components/ContinueCard';
import { RecommendedStoryCard } from '../components/RecommendedStoryCard';
import { findStory, MOCK_PROGRESS, MOCK_STORIES } from '../model/types';

/** 디자인 실측: 추천 이야기는 세 편까지 보인다. 더 넣으면 카드 높이가 무너진다. */
const RECOMMENDATION_COUNT = 3;

export interface HomeScreenProps {
  /** 지금 쓰는 아이 이름. 인사말과 전환 알약에 쓴다. */
  childName: string;
  onSwitchChild: () => void;
}

/**
 * 메인 화면 (Figma 78:184).
 *
 * 왼쪽은 읽다 만 이야기 하나, 오른쪽은 추천 세 편. 아이가 앱을 열자마자
 * "뭘 할지" 고민하지 않게 두 갈래만 준다.
 *
 * 아이 목록·전환 모달은 이 화면이 모른다 — story feature 가 child/account 를
 * 직접 가져오면 안 되므로 라우트에서 조립한다 (src/features/README.md).
 */
export function HomeScreen({ childName, onSwitchChild }: HomeScreenProps): React.JSX.Element {
  const router = useRouter();
  const { select } = useResponsive();

  // 두 단 사이 간격. 디자인(48)은 태블릿 가로 기준이라 폭이 줄면 같이 줄인다.
  const columnGap = select({
    compact: spacing.xl,
    medium: spacing['3xl'],
    expanded: spacing['5xl'],
  });

  const continueStory = findStory(MOCK_PROGRESS.storyId);
  const recommended = MOCK_STORIES.filter((story) => story.id !== continueStory?.id).slice(
    0,
    RECOMMENDATION_COUNT,
  );

  const openStory = (id: string): void => {
    router.push({ pathname: '/story/[id]', params: { id } });
  };

  return (
    <Screen>
      <View style={styles.page}>
        <Appear style={styles.header}>
          <View style={styles.greeting}>
            <Text variant="title">
              안녕, {childName}
              {vocativeParticle(childName)}!
            </Text>
            <Text variant="bodyLarge" color="textMuted">
              오늘은 어떤 이야기를 만나볼까?
            </Text>
          </View>
          <ChildSwitcher name={childName} onPress={onSwitchChild} />
        </Appear>

        <View style={[styles.body, { gap: columnGap }]}>
          {continueStory === undefined ? (
            // 아직 읽다 만 이야기가 없는 아이(첫 실행)에게는 카드가 아예 없다.
            // 디자인에 없는 상태라 문구는 직접 지었다.
            <Appear delay={40} style={styles.column}>
              <EmptyState
                title="아직 읽던 이야기가 없어요"
                description="오른쪽에서 마음에 드는 이야기를 골라볼까요?"
              />
            </Appear>
          ) : (
            <Appear delay={40} style={styles.column}>
              <ContinueCard
                story={continueStory}
                ratio={MOCK_PROGRESS.ratio}
                onPress={() => openStory(continueStory.id)}
              />
            </Appear>
          )}

          <Appear delay={80} style={styles.column}>
            <Text variant="subtitle">추천 이야기</Text>
            <View style={styles.recommendations}>
              {recommended.map((story) => (
                <RecommendedStoryCard
                  key={story.id}
                  story={story}
                  onPress={() => openStory(story.id)}
                />
              ))}
            </View>
          </Appear>
        </View>
      </View>
    </Screen>
  );
}

/**
 * 이름 뒤에 붙는 호격 조사. 받침이 있으면 "아"(규한아), 없으면 "야"(지오야).
 *
 * 한글 음절은 유니코드에서 (초성, 중성, 종성) 순으로 배열돼 있어, 시작점부터의
 * 거리를 종성 개수(28)로 나눈 나머지가 0이면 받침이 없다.
 */
function vocativeParticle(name: string): '아' | '야' {
  const trimmed = name.trim();
  const code = trimmed.charCodeAt(trimmed.length - 1);
  const isHangulSyllable = code >= 0xac00 && code <= 0xd7a3;
  if (!isHangulSyllable) return '야';

  return (code - 0xac00) % 28 === 0 ? '야' : '아';
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing['2xl'],
    paddingTop: spacing['4xl'], // 디자인 실측(py 32)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  greeting: {
    // 인사말이 길어져도 전환 알약을 화면 밖으로 밀지 않게 한다.
    flex: 1,
    gap: spacing.md,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    gap: spacing.md,
  },
  recommendations: {
    flex: 1,
    gap: spacing.md,
  },
});
