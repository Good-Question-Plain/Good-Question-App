import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, spacing } from '@/shared/theme';
import {
  Appear,
  EmptyState,
  PressableScale,
  Screen,
  SearchIcon,
  SegmentedTabs,
  Text,
} from '@/shared/ui';

import { StoryWordGroup } from '../components/StoryWordGroup';
import { WordCard } from '../components/WordCard';
import { groupByStory, MOCK_WORDS, type WordEntry } from '../model/types';

const FILTERS = ['전체', '이야기별'] as const;
type Filter = (typeof FILTERS)[number];

/** 디자인 실측: 4열, 카드 높이 279, 간격 16. */
const COLUMNS = 4;
const CARD_HEIGHT = 279;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

/**
 * 단어장 (Figma 118:45 / 181:864).
 *
 * 아이가 이야기 중 모르는 단어로 저장해둔 것들을 모아 보여준다.
 * '이야기별'은 같은 이야기에서 나온 단어를 묶어 보여주는 필터다.
 */
export function WordbookScreen(): React.JSX.Element {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('전체');
  const [words, setWords] = useState<readonly WordEntry[]>(MOCK_WORDS);

  const toggleSave = (id: string): void => {
    setWords((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, saved: !entry.saved } : entry)),
    );
  };

  const groups = groupByStory(words);
  const rows = chunk(words, COLUMNS);
  const isEmpty = words.length === 0;

  const openDetail = (id: string): void => {
    router.push({ pathname: '/word/[id]', params: { id } });
  };

  return (
    <Screen>
      <View style={styles.page}>
        <Appear>
          <View style={styles.header}>
            <Text variant="title">단어장</Text>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="검색"
              scaleTo={0.88}
              hitSlop={hitSlopFor(24)}
            >
              <SearchIcon width={24} height={24} color={colors.textStrong} />
            </PressableScale>
          </View>
        </Appear>

        <Appear delay={40}>
          <SegmentedTabs items={FILTERS} value={filter} onChange={setFilter} />
        </Appear>

        {isEmpty ? (
          <EmptyState
            title="아직 저장한 단어가 없어요"
            description="이야기를 하면서 모르는 단어를 저장해봐요"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.listScroll}>
            {filter === '전체' ? (
              <Appear delay={80} style={styles.grid}>
                {rows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((entry) => (
                      <WordCard
                        key={entry.id}
                        entry={entry}
                        onToggleSave={() => toggleSave(entry.id)}
                        onPress={() => openDetail(entry.id)}
                        style={styles.cell}
                      />
                    ))}
                    {row.length < COLUMNS &&
                      Array.from({ length: COLUMNS - row.length }, (_, index) => (
                        <View key={`filler-${index}`} style={styles.cell} />
                      ))}
                  </View>
                ))}
              </Appear>
            ) : (
              <Appear delay={80} style={styles.groups}>
                {groups.map((group, index) => (
                  <StoryWordGroup
                    key={group.storyTitle}
                    group={group}
                    tintIndex={index}
                    defaultOpen={index === 0}
                    onSelectWord={openDetail}
                  />
                ))}
              </Appear>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listScroll: {
    paddingBottom: spacing.xl,
  },
  grid: {
    gap: spacing.xl,
  },
  groups: {
    gap: spacing.lg,
  },
  // 카드 높이를 줄이 잡는다. 내용에 맡기면 단어 길이에 따라 칸마다 높이가 달라지고,
  // 디자인(226x279)보다 한참 납작해진다.
  row: {
    flexDirection: 'row',
    gap: spacing.xl,
    height: CARD_HEIGHT,
  },
  cell: {
    flex: 1,
  },
});
