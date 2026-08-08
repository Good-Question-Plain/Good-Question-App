import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Appear, Chip, EmptyState, Screen, Text } from '@/shared/ui';

import { StoryCard } from '../components/StoryCard';
import { MOCK_STORIES, STORY_CATEGORIES, type Story, type StoryCategory } from '../model/types';

/** 디자인 실측: 3열, 카드 높이 281, 간격 16. */
const COLUMNS = 3;
const CARD_HEIGHT = 281;

/**
 * 한 줄에 COLUMNS 개씩 끊는다.
 *
 * `flexWrap` + 퍼센트 폭을 쓰지 않는 이유: gap 이 열 사이에 들어가는 만큼을
 * 퍼센트에서 뺄 방법이 RN 에는 없어서(calc 없음) 3열이 넘치거나 어긋난다.
 * 행을 직접 만들고 각 칸을 flex:1 로 두면 gap 을 제외한 나머지를 정확히 삼등분한다.
 */
function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

/**
 * 이야기 목록 (Figma 125:115).
 *
 * 카테고리 칩으로 거르고, 카드 3열 그리드로 보여준다.
 * 태블릿 가로에서 3열이 디자인 기준이라 열 수는 고정한다 — 열 수가 바뀌면
 * 카드 안 썸네일 비율이 무너져 아이가 그림을 알아보기 어려워진다.
 */
export function StoryListScreen(): React.JSX.Element {
  const router = useRouter();
  const [category, setCategory] = useState<StoryCategory>('전체');

  const stories: readonly Story[] =
    category === '전체' ? MOCK_STORIES : MOCK_STORIES.filter((story) => story.tag === category);
  const rows = chunk(stories, COLUMNS);

  return (
    <Screen>
      <View style={styles.page}>
        <Appear>
          <Text variant="display">이야기</Text>
        </Appear>

        <Appear delay={40}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {STORY_CATEGORIES.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={item === category}
                onPress={() => setCategory(item)}
              />
            ))}
          </ScrollView>
        </Appear>

        {stories.length === 0 ? (
          <EmptyState
            title="아직 이야기가 없어요"
            description={`'${category}' 이야기는 곧 찾아올 거예요`}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.gridScroll}>
            <Appear delay={80} style={styles.grid}>
              {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {row.map((story, columnIndex) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      tintIndex={rowIndex * COLUMNS + columnIndex}
                      onPress={() =>
                        router.push({ pathname: '/story/[id]', params: { id: story.id } })
                      }
                      style={styles.cell}
                    />
                  ))}
                  {/* 마지막 줄이 덜 찼을 때 카드가 늘어나지 않도록 빈 칸을 채운다. */}
                  {row.length < COLUMNS &&
                    Array.from({ length: COLUMNS - row.length }, (_, index) => (
                      <View key={`filler-${index}`} style={styles.cell} />
                    ))}
                </View>
              ))}
            </Appear>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  categories: {
    gap: spacing.md,
    paddingRight: spacing['3xl'],
  },
  gridScroll: {
    paddingBottom: spacing.xl,
  },
  grid: {
    gap: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xl,
    height: CARD_HEIGHT,
  },
  cell: {
    flex: 1,
  },
});
