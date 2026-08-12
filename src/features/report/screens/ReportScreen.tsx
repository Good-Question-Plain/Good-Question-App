import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';
import {
  Appear,
  ArrowLeftIcon,
  BottomTabBar,
  Button,
  ChildSwitcher,
  type ChildSwitcherOption,
  EmptyState,
  PillTabs,
  PressableScale,
  ProfileFillIcon,
  Screen,
  type TabKey,
  Text,
} from '@/shared/ui';

import { HighlightCard } from '../components/HighlightCard';
import { HomeTopics } from '../components/HomeTopics';
import { SkillPanel } from '../components/SkillPanel';
import { VocabularyPanel } from '../components/VocabularyPanel';
import { formatReportDate, MOCK_REPORTS, REPORT_TABS, type ReportTab } from '../model/types';

/** 하단 탭 키를 라우트로 옮기는 표. typedRoutes 를 쓰므로 문자열 조립 대신 표로 둔다. */
const TAB_ROUTES = {
  home: '/(tabs)/home',
  story: '/(tabs)/story',
  wordbook: '/(tabs)/wordbook',
  mypage: '/(tabs)/mypage',
} as const satisfies Record<TabKey, string>;

export interface ReportScreenProps {
  /** 지금 보고 있는 아이 */
  childName: string;
  /** 전환 알약을 펼쳤을 때 고를 수 있는 아이들 */
  childOptions: readonly ChildSwitcherOption[];
  onSelectChild: (id: string) => void;
}

/**
 * 보호자 리포트 (Figma 252:193 · 252:249 · 252:297).
 *
 * 아이가 이야기를 한 편 끝낼 때마다 쌓이는, 보호자만 보는 화면이다.
 * 마이페이지에서 보호자 확인을 통과해야 들어온다.
 *
 * 세로 구성은 디자인을 그대로 따랐다 — 헤더 · 이야기 줄 · 말하기 특징 · 탭까지는
 * 고정이고, 탭 내용부터 아래(대표 발화 · 집에서 이어가기 · 리포트 이동)만 스크롤한다.
 * 탭을 눌러 비교하는 화면이라 탭이 스크롤을 따라 올라가버리면 쓰기 어렵다.
 *
 * TODO: 리포트 조회 API 연결 (지금은 목데이터 두 편을 앞뒤로 넘긴다)
 */
export function ReportScreen({
  childName,
  childOptions,
  onSelectChild,
}: ReportScreenProps): React.JSX.Element {
  const router = useRouter();
  // 가장 최근 리포트부터 본다. 배열 뒤가 최신이다.
  const [index, setIndex] = useState(MOCK_REPORTS.length - 1);
  const [tab, setTab] = useState<ReportTab>(REPORT_TABS[0]);

  const report = MOCK_REPORTS[index];

  const header = (
    <View style={styles.header}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="뒤로"
        onPress={() => router.back()}
        scaleTo={0.94}
        hitSlop={hitSlopFor(24)}
        style={styles.back}
      >
        <ArrowLeftIcon width={26} height={15} color={colors.text} />
        <Text variant="word">학습 리포트</Text>
      </PressableScale>

      {/* 이 화면만 바탕이 흰색이라 알약은 디자인대로 회색을 쓴다 (뒤집으면 사라진다). */}
      <ChildSwitcher
        name={childName}
        options={childOptions}
        onSelect={onSelectChild}
        tone="surface"
      />
    </View>
  );

  const tabBar = (
    <BottomTabBar active="mypage" onSelect={(key) => router.replace(TAB_ROUTES[key])} />
  );

  if (report === undefined) {
    return (
      <Screen background="surface">
        <View style={styles.page}>
          {header}
          <EmptyState
            title="아직 리포트가 없어요"
            description="이야기를 한 편 끝내면 여기에 쌓여요"
          />
          {tabBar}
        </View>
      </Screen>
    );
  }

  return (
    <Screen background="surface">
      <View style={styles.page}>
        <Appear>{header}</Appear>

        <Appear delay={40} style={styles.summary}>
          <View style={styles.storyRow}>
            <View style={styles.storyBadge}>
              <ProfileFillIcon width={34} height={34} />
            </View>
            <View style={styles.storyText}>
              <Text variant="heading" numberOfLines={1}>
                {report.storyTitle}
              </Text>
              <Text variant="footnote" color="textMuted">
                {formatReportDate(report.completedAt)}
              </Text>
            </View>
          </View>

          <View style={styles.traitCard}>
            <Text variant="bodyBold" color="primaryText">
              {childName}의 말하기 특징
            </Text>
            <Text style={styles.traitBody}>{report.trait}</Text>
          </View>
        </Appear>

        {/*
          탭 · 읽는 영역 · 하단 탭 바는 디자인(284:220)에서 한 덩어리다. 위 블록들과
          간격(16)이 다르므로(탭↔내용 8, 내용↔탭바 10) 페이지 gap 에 맡기지 않는다.
        */}
        <View style={styles.panel}>
          <Appear delay={80} style={styles.tabs}>
            <PillTabs items={REPORT_TABS} value={tab} onChange={setTab} />
          </Appear>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollBody}>
            {tab === '어휘' && (
              <VocabularyPanel childName={childName} vocabulary={report.vocabulary} />
            )}
            {tab === '표현' && <SkillPanel title="표현" skills={report.expression} />}
            {tab === '논리' && <SkillPanel title="논리" skills={report.logic} />}

            <HighlightCard childName={childName} highlight={report.highlight} />

            <HomeTopics
              childName={childName}
              storyTopics={report.storyTopics}
              dailyTopics={report.dailyTopics}
            />

            <View style={styles.pager}>
              <Button
                label="이전 리포트 보기"
                variant="secondary"
                size="lg"
                disabledTone="neutral"
                disabled={index === 0}
                onPress={() => setIndex((prev) => prev - 1)}
                style={styles.pagerButton}
              />
              <Button
                label="다음 리포트 보기"
                size="lg"
                disabledTone="neutral"
                disabled={index === MOCK_REPORTS.length - 1}
                onPress={() => setIndex((prev) => prev + 1)}
                style={styles.pagerButton}
              />
            </View>
          </ScrollView>

          {tabBar}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summary: {
    gap: spacing['2xl'],
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAccentWarm,
  },
  storyBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 39, // 디자인 실측
    height: 39,
    borderRadius: radius.full,
    backgroundColor: colors.primaryAccent,
  },
  // 이야기 제목이 길어도 뱃지를 밀어내지 않도록 남는 폭만 쓴다.
  storyText: {
    flex: 1,
    gap: spacing.xs,
  },
  traitCard: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderWidth: 1,
    borderTopWidth: 4, // 디자인 실측
    borderRadius: radius.md,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  traitBody: {
    lineHeight: 30.6, // 디자인 실측
  },
  // 탭 · 읽는 영역 · 하단 탭 바 묶음. 안쪽 간격이 페이지 간격(16)과 달라 따로 잡는다.
  panel: {
    flex: 1,
  },
  tabs: {
    marginBottom: spacing.sm, // 디자인 실측 (탭 → 내용 8)
  },
  // 탭 내용부터 아래만 스크롤한다. flex 로 남는 높이를 전부 차지하게 둬야
  // 화면이 높아질수록 읽는 창도 같이 커진다.
  scroll: {
    flex: 1,
    marginBottom: spacing.md, // 디자인 실측 (내용 → 하단 탭 바 10)
  },
  scrollBody: {
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  pager: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  pagerButton: {
    flex: 1,
    height: 52, // 디자인 실측. Button 의 어느 size 보다 커서 직접 지정한다.
  },
});
