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

import { useToggleWordSaved, useWords } from '../api/queries';
import { StoryWordGroup } from '../components/StoryWordGroup';
import { WordCard } from '../components/WordCard';
import { groupByStory, type WordEntry } from '../model/types';

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

export interface WordbookScreenProps {
  /** 단어장은 아이별이다. `GET /vocabulary` 가 `child_id` 를 필수로 받는다. */
  childId: string;
  /** 카드 뱃지에 쓸 이름. 목록이 이미 이 아이 것으로 걸러져 있다. */
  childName: string;
  /**
   * 서버 목록이 비었을 때 대신 보여줄 단어들.
   *
   * 서버가 아이 발화를 못 받아서(인수인계 1-1) 단어장이 늘 비어 있다. 이야기에서
   * 고른 낱말을 앱이 기억해뒀다가 라우트가 넘겨준다. **서버가 하나라도 주면
   * 서버 것이 이긴다.**
   */
  fallbackWords?: readonly WordEntry[];
}

/**
 * 단어장 (Figma 118:45 / 181:864).
 *
 * 아이가 이야기 중 모르는 단어로 저장해둔 것들을 모아 보여준다.
 * '이야기별'은 같은 이야기에서 나온 단어를 묶어 보여주는 필터다.
 *
 * wordbook 은 child 를 모른다 — 어느 아이인지는 라우트가 넘긴다.
 */
export function WordbookScreen({
  childId,
  childName,
  fallbackWords,
}: WordbookScreenProps): React.JSX.Element {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('전체');
  const { data, isLoading, isError } = useWords(childId);
  const toggleSaved = useToggleWordSaved(childId);

  const serverWords = data ?? [];
  const words = serverWords.length > 0 ? serverWords : (fallbackWords ?? []);
  const groups = groupByStory(words);
  const rows = chunk(words, COLUMNS);
  // 로딩 중에는 빈 상태 문구를 띄우지 않는다 — "저장한 단어가 없어요"가 잠깐
  // 떴다 사라지면 아이가 방금 저장한 단어가 지워진 줄 안다.
  const isEmpty = !isLoading && !isError && words.length === 0;

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

        {isError ? (
          <EmptyState
            title="단어장을 불러오지 못했어요"
            description="연결 상태를 확인하고 다시 시도해주세요"
          />
        ) : isEmpty ? (
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
                        childName={childName}
                        onToggleSave={() =>
                          toggleSaved.mutate({ vocabId: entry.id, saved: !entry.saved })
                        }
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
