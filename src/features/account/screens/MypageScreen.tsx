import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { supabase } from '@/shared/api';
import { colors, radius, spacing } from '@/shared/theme';
import {
  Appear,
  HelpIcon,
  LogoutIcon,
  MenuRow,
  PlusIcon,
  PressableScale,
  ReportIcon,
  Screen,
  SettingsIcon,
  Text,
  WithdrawIcon,
} from '@/shared/ui';

import { useWithdrawAccount } from '../api/queries';
import { ConfirmModal } from '../components/ConfirmModal';
import { ParentGateModal } from '../components/ParentGateModal';
import { ProfileCard } from '../components/ProfileCard';
import { WithdrawModal } from '../components/WithdrawModal';

type OpenModal = 'logout' | 'withdraw' | 'parentGate' | null;

/** 보호자 확인이 필요한 메뉴. 아이가 혼자 눌러도 넘어가지 않게 막는다. */
type GatedTarget = 'report' | 'account';

/** 디자인 실측: 아이 카드가 한 줄에 3칸. */
const CHILD_COLUMNS = 3;

type ChildCell = { kind: 'child'; child: MypageChild; index: number } | { kind: 'add' };

export interface MypageChild {
  id: string;
  name: string;
  age: number;
}

export interface MypageScreenProps {
  parentName: string;
  parentEmail: string;
  /**
   * 보호자에게 등록된 아이 목록.
   *
   * account feature 가 child feature 를 직접 가져오지 않도록 라우트에서 받아온다.
   * (feature 끼리 의존하면 순환 참조가 생긴다 — src/features/README.md 참고)
   */
  childProfiles: readonly MypageChild[];
}

/**
 * 마이페이지 (Figma 234:567).
 *
 * 보호자 카드 → 우리 아이들 → 설정 메뉴 순서. 아이가 쓰는 태블릿에 그대로 열려
 * 있는 화면이라, 리포트와 계정 설정은 보호자 확인을 거친 뒤에만 들어간다.
 */
export function MypageScreen({
  parentName,
  parentEmail,
  childProfiles,
}: MypageScreenProps): React.JSX.Element {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const withdraw = useWithdrawAccount();
  const [gatedTarget, setGatedTarget] = useState<GatedTarget | null>(null);

  const close = (): void => setOpenModal(null);

  // 아이 카드 + "추가하기" 를 한 줄 3칸으로 끊는다. flexWrap 에 맡기면 마지막
  // 줄에 혼자 남은 카드가 가로를 다 차지해 다른 카드와 폭이 달라진다.
  const cells: ChildCell[] = [
    ...childProfiles.map((child, index) => ({ kind: 'child' as const, child, index })),
    { kind: 'add' as const },
  ];
  const childRows: ChildCell[][] = [];
  for (let i = 0; i < cells.length; i += CHILD_COLUMNS) {
    childRows.push(cells.slice(i, i + CHILD_COLUMNS));
  }

  const requestGated = (target: GatedTarget): void => {
    setGatedTarget(target);
    setOpenModal('parentGate');
  };

  const handleGatePassed = (): void => {
    close();
    if (gatedTarget === 'report') {
      router.push('/report');
    }
    // TODO: 계정 설정 화면 연결 (디자인 준비 중)
    setGatedTarget(null);
  };

  return (
    <Screen scrollable>
      <View style={styles.page}>
        <Appear>
          <Text variant="title">마이페이지</Text>
        </Appear>

        <Appear delay={40}>
          <ProfileCard
            variant="parent"
            name={parentName}
            caption={parentEmail}
            onEdit={() => requestGated('account')}
          />
        </Appear>

        <Appear delay={80} style={styles.section}>
          <Text variant="captionStrong">우리 아이들</Text>
          {childRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.childRow}>
              {row.map((item) =>
                item.kind === 'child' ? (
                  <ProfileCard
                    key={item.child.id}
                    name={item.child.name}
                    // 나이를 모를 수 있다 — 아이를 만들 때 생년을 보낼 자리가
                    // 명세에 없어서 서버가 0 을 줄 수 있다. "0세"보다 빈 칸이 낫다.
                    caption={item.child.age > 0 ? `${item.child.age}세` : ''}
                    tintIndex={item.index}
                    onEdit={() => router.push('/child/create')}
                    style={styles.childCell}
                  />
                ) : (
                  <PressableScale
                    key="add"
                    accessibilityRole="button"
                    accessibilityLabel="아이 추가하기"
                    onPress={() => router.push('/child/create')}
                    scaleTo={0.985}
                    style={[styles.childCell, styles.addCard]}
                  >
                    <PlusIcon width={18} height={18} color={colors.textSubtle} />
                    <Text variant="captionSmall" color="textSubtle">
                      아이 추가하기
                    </Text>
                  </PressableScale>
                ),
              )}
              {/* 마지막 줄이 덜 찼을 때 카드가 늘어나지 않도록 빈 칸을 채운다. */}
              {row.length < CHILD_COLUMNS &&
                Array.from({ length: CHILD_COLUMNS - row.length }, (_, i) => (
                  <View key={`filler-${i}`} style={styles.childCell} />
                ))}
            </View>
          ))}
        </Appear>

        <Appear delay={120} style={styles.menu}>
          <MenuRow
            label="학습 리포트 보기"
            Icon={ReportIcon}
            tone="textStrong"
            showChevron
            onPress={() => requestGated('report')}
          />
          <MenuRow
            label="계정 설정"
            Icon={SettingsIcon}
            tone="textStrong"
            showChevron
            onPress={() => requestGated('account')}
          />
          <MenuRow
            label="도움말"
            Icon={HelpIcon}
            tone="textStrong"
            showChevron
            onPress={() => {
              // TODO: 도움말 화면 연결 (디자인 준비 중)
            }}
          />
          <MenuRow
            label="로그아웃"
            Icon={LogoutIcon}
            tone="timer"
            onPress={() => setOpenModal('logout')}
          />
          <MenuRow
            label="회원탈퇴"
            Icon={WithdrawIcon}
            tone="danger"
            last
            onPress={() => setOpenModal('withdraw')}
          />
        </Appear>
      </View>

      <ParentGateModal
        visible={openModal === 'parentGate'}
        onConfirm={handleGatePassed}
        onCancel={() => {
          close();
          setGatedTarget(null);
        }}
      />

      <ConfirmModal
        visible={openModal === 'logout'}
        title="로그아웃 할까요?"
        description="다시 로그인하면 이어서 사용할 수 있어요"
        confirmLabel="로그아웃"
        onConfirm={() => {
          close();
          // 세션을 지우면 AuthGate 가 로그인 화면으로 되돌린다. 여기서 직접
          // 이동하지 않는 이유는, 저장된 세션이 남은 채로 화면만 옮기면
          // 딥링크로 다시 들어올 수 있기 때문이다.
          // signOut 은 실패해도 로컬 세션은 지워지므로 결과를 기다리지 않는다.
          void supabase.auth.signOut();
        }}
        onCancel={close}
      />

      <WithdrawModal
        visible={openModal === 'withdraw'}
        loading={withdraw.isPending}
        onConfirm={() => {
          if (withdraw.isPending) return;
          // 성공하면 세션이 사라지고 AuthGate 가 로그인 화면으로 되돌린다.
          // 모달은 그때까지 열어둔다 — 먼저 닫으면 누른 뒤 아무 반응이 없다.
          withdraw.mutate(undefined, { onSuccess: close });
        }}
        onCancel={close}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  section: {
    gap: spacing.lg,
  },
  childRow: {
    flexDirection: 'row',
    gap: spacing.lg, // 디자인 실측 (카드 사이만 12, 메뉴/카드의 세로 간격과 다르다)
  },
  childCell: {
    flex: 1,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 66, // 디자인 실측
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    borderColor: colors.borderStrong,
  },
  menu: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.surfaceMuted,
  },
});
