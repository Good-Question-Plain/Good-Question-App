import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadow, spacing } from '@/shared/theme';
import { Appear, ChevronDownIcon, PressableScale, ProfileFillIcon, Text } from '@/shared/ui';

import { formatReportDate, type LearningReport } from '../model/types';

export interface StoryPickerProps {
  /** 지금 보고 있는 리포트 */
  current: LearningReport;
  /** 고를 수 있는 리포트 전체 */
  reports: readonly LearningReport[];
  onSelect: (id: string) => void;
}

/**
 * 리포트 위쪽의 이야기 줄. 누르면 다른 이야기의 리포트로 바꾼다 (Figma 320:197).
 *
 * 2026-08-12 에 이야기 줄에 화살표가 붙으면서 드롭다운 트리거가 됐다. 아래·위
 * 버튼("이전/다음 리포트 보기")으로만 넘기던 걸, 목록에서 바로 고를 수 있게 됐다.
 *
 * 펼친 목록은 폭 244 로 줄 자체(959)보다 훨씬 좁다 — 디자인이 그렇다.
 */
export function StoryPicker({ current, reports, onSelect }: StoryPickerProps): React.JSX.Element {
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const close = (): void => setAnchor(null);
  const open = (): void => {
    anchorRef.current?.measureInWindow((x, y) => setAnchor({ x, y }));
  };

  return (
    <View ref={anchorRef} collapsable={false}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${current.storyTitle} 리포트, 눌러서 다른 이야기 고르기`}
        accessibilityState={{ expanded: anchor !== null }}
        onPress={open}
        scaleTo={0.995}
        style={styles.row}
      >
        <StoryLine report={current} expanded={anchor !== null} />
      </PressableScale>

      <Modal
        visible={anchor !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="닫기" onPress={close} />

        {anchor !== null && (
          <Appear style={[styles.card, { left: anchor.x, top: anchor.y }]}>
            {reports.map((report, index) => (
              <PressableScale
                key={report.id}
                accessibilityRole="button"
                accessibilityLabel={`${report.storyTitle} 리포트`}
                accessibilityState={{ selected: report.id === current.id }}
                onPress={() => {
                  close();
                  onSelect(report.id);
                }}
                style={[styles.option, index < reports.length - 1 && styles.optionDivided]}
              >
                <StoryLine report={report} expanded={report.id === current.id ? true : undefined} />
              </PressableScale>
            ))}
          </Appear>
        )}
      </Modal>
    </View>
  );
}

interface StoryLineProps {
  report: LearningReport;
  /**
   * 화살표 상태. `true` 면 펼쳐진 모양(위 방향), `false` 면 접힌 모양,
   * `undefined` 면 화살표 없이 자리만 비운다 — 목록의 다른 줄들이 그렇다.
   */
  expanded?: boolean;
}

/** 화살표 자리 + 아바타 + 제목·날짜. 줄과 목록이 같은 모양이라 함께 쓴다. */
function StoryLine({ report, expanded }: StoryLineProps): React.JSX.Element {
  return (
    <View style={styles.line}>
      <View style={styles.chevronSlot}>
        {expanded !== undefined && (
          <ChevronDownIcon
            width={14}
            height={14}
            color={colors.textStrong}
            style={expanded ? styles.chevronUp : undefined}
          />
        )}
      </View>

      <View style={styles.avatar}>
        <ProfileFillIcon width={34} height={34} />
      </View>

      <View style={styles.text}>
        <Text variant="heading" numberOfLines={1}>
          {report.storyTitle}
        </Text>
        <Text variant="footnote" color="textMuted">
          {formatReportDate(report.completedAt)}
        </Text>
      </View>
    </View>
  );
}

const CARD_WIDTH = 244; // 디자인 실측

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing['2xl'], // 디자인 실측
    paddingVertical: spacing.xl, // 디자인 실측
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAccentWarm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 화살표가 없는 줄도 아바타 위치가 같아야 해서 자리를 항상 잡아둔다.
  chevronSlot: {
    width: 16, // 디자인 실측 (화살표 14 + 오른쪽 2)
    alignItems: 'flex-start',
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 39, // 디자인 실측
    height: 39,
    borderRadius: radius.full,
    backgroundColor: colors.primaryAccent,
  },
  // 제목이 길어도 아바타를 밀지 않도록 남는 폭만 쓴다.
  text: {
    flex: 1,
    gap: spacing.xs,
    marginLeft: spacing.xl, // 디자인 실측
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  option: {
    justifyContent: 'center',
    minHeight: 56, // 디자인 실측
    paddingHorizontal: 14, // 디자인 실측
  },
  optionDivided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
