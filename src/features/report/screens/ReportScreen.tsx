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
  PillTabs,
  PressableScale,
  ProfileFillIcon,
  Screen,
  type TabKey,
  Text,
} from '@/shared/ui';

import { isReportMissing, useGenerateStoryReport, useStoryReport } from '../api/queries';
import { HighlightCard } from '../components/HighlightCard';
import { HomeTopics } from '../components/HomeTopics';
import { ReportPlaceholder } from '../components/ReportPlaceholder';
import { SkillPanel } from '../components/SkillPanel';
import { VocabularyPanel } from '../components/VocabularyPanel';
import { toLearningReport } from '../model/fromApi';
import { formatReportDate, REPORT_TABS, type ReportTab } from '../model/types';

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
  childId: string;
  /** 전환 알약을 펼쳤을 때 고를 수 있는 아이들 */
  /** 지금 보고 있는 아이가 올린 사진. 알약에도 이름 대신 사진이 뜬다. */
  childPhotoUrl?: string | null;
  childOptions: readonly ChildSwitcherOption[];
  onSelectChild: (id: string) => void;
  /** 어느 이야기의 리포트를 볼지. 라우트가 넘긴다. */
  storyId: string;
  /** 이전/다음 리포트로 옮길 때 부른다. */
  onSelectStory: (storyId: string) => void;
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
 * **이야기 선택 드롭다운(320:197)은 지금 없다.** 서버가 리포트를 한 편씩만
 * 주고 목록을 주지 않아서(이전/다음 이야기 id 만 온다) 고를 목록을 만들 수 없다.
 * 이동은 아래 "이전/다음 리포트 보기" 버튼이 그대로 담당한다.
 * **리포트 목록 API 가 생기면 `StoryPicker` 를 되살리면 된다** — 컴포넌트는 남겨뒀다.
 */
export function ReportScreen({
  childName,
  childPhotoUrl,
  childId,
  childOptions,
  onSelectChild,
  storyId,
  onSelectStory,
}: ReportScreenProps): React.JSX.Element {
  const router = useRouter();
  const [tab, setTab] = useState<ReportTab>(REPORT_TABS[0]);

  const { data, isLoading, isError, error } = useStoryReport(childId, storyId);
  const generate = useGenerateStoryReport(childId);

  // 서버가 준 리포트를 화면 모양으로 옮긴다. 아직 없으면 undefined 다.
  const report =
    data === undefined || data.status !== 'completed'
      ? undefined
      : toLearningReport(data, data.completedAt ?? '');

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
        photoUrl={childPhotoUrl}
        options={childOptions}
        onSelect={onSelectChild}
        tone="surface"
      />
    </View>
  );

  const tabBar = (
    <BottomTabBar active="mypage" onSelect={(key) => router.replace(TAB_ROUTES[key])} />
  );

  /**
   * 리포트가 아직 없을 때 본문 대신 들어가는 안내.
   *
   * **디자인에 없는 상태들이다.** 서버가 리포트를 자동으로 만들지 않아서
   * "없음 → 만드는 중 → 완료" 를 보호자에게 알려줄 자리가 필요하다.
   */
  function renderPlaceholder(): React.JSX.Element {
    // 어느 이야기인지 정해지지 않았다. **"리포트가 없다"고 하면 안 된다** —
    // 방금 이야기를 끝낸 보호자가 그 문구를 보면 기록이 사라진 줄 안다.
    if (storyId.length === 0) {
      return (
        <ReportPlaceholder
          title="어느 이야기의 리포트를 볼지 정해주세요"
          description="이야기를 한 편 열어보면 그 이야기의 리포트를 볼 수 있어요"
        />
      );
    }

    // 아직 안 만든 리포트다(404). 에러가 아니라 정상 경로라 만들기를 권한다.
    if (isError && isReportMissing(error)) {
      return (
        <ReportPlaceholder
          title="아직 리포트가 없어요"
          description={`${childName}의 이야기 기록으로 리포트를 만들어 볼까요?`}
          actionLabel="리포트 만들기"
          actionLoading={generate.isPending}
          onAction={() => generate.mutate(storyId)}
        />
      );
    }

    if (isError) {
      return (
        <ReportPlaceholder
          title="리포트를 불러오지 못했어요"
          description="연결 상태를 확인하고 다시 시도해주세요"
        />
      );
    }

    if (data?.status === 'failed') {
      return (
        <ReportPlaceholder
          title="리포트를 만들지 못했어요"
          description={data.failureReason ?? '잠시 후 다시 시도해주세요'}
          actionLabel="다시 만들기"
          actionLoading={generate.isPending}
          onAction={() => generate.mutate(storyId)}
        />
      );
    }

    // generating 이면 `useStoryReport` 가 3초마다 다시 물어보므로 기다리면 된다.
    if (data?.status === 'generating' || generate.isPending) {
      return (
        <ReportPlaceholder title="리포트를 만들고 있어요" description="잠시만 기다려주세요" busy />
      );
    }

    if (isLoading) {
      return <ReportPlaceholder title="리포트를 불러오는 중이에요" busy />;
    }

    return (
      <ReportPlaceholder
        title="아직 리포트가 없어요"
        description="이야기를 한 편 끝내면 여기에 쌓여요"
      />
    );
  }

  if (report === undefined) {
    return (
      <Screen background="surface">
        <View style={styles.page}>
          {header}
          {renderPlaceholder()}
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
            <ProfileFillIcon width={24} height={24} />
            <Text variant="subheadingBold" numberOfLines={1} style={styles.storyTitle}>
              {report.storyTitle}
            </Text>
            {report.completedAt.length > 0 && (
              <Text variant="captionSmall" color="textMuted">
                {formatReportDate(report.completedAt)}
              </Text>
            )}
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

            {/*
              서버가 "리포트가 있는 이전/다음 이야기" id 를 직접 준다. 없으면 null 이라
              그대로 비활성 조건이 된다 — 끝에 도달하면 정말 못 누르는 버튼이므로
              옅은 주황 대신 회색(disabledTone)으로 내린다.
            */}
            <View style={styles.pager}>
              <Button
                label="이전 리포트 보기"
                variant="secondary"
                size="lg"
                disabledTone="neutral"
                disabled={data?.previousStoryId === null || data?.previousStoryId === undefined}
                onPress={() => {
                  if (data?.previousStoryId !== null && data?.previousStoryId !== undefined) {
                    onSelectStory(data.previousStoryId);
                  }
                }}
                style={styles.pagerButton}
              />
              <Button
                label="다음 리포트 보기"
                size="lg"
                disabledTone="neutral"
                disabled={data?.nextStoryId === null || data?.nextStoryId === undefined}
                onPress={() => {
                  if (data?.nextStoryId !== null && data?.nextStoryId !== undefined) {
                    onSelectStory(data.nextStoryId);
                  }
                }}
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
  // 이야기 줄. 드롭다운이 빠지면서 제목 + 완료 시각만 남았다 (아이콘은 252:204 그대로).
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // 제목이 길어도 완료 시각을 밀어내지 않게 남는 폭만 차지한다.
  storyTitle: {
    flex: 1,
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
