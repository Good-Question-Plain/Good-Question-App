import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MOCK_CHILDREN } from '@/features/child';
import { spacing } from '@/shared/theme';
import { Appear, Button, Card, findAvatar, PressableScale, Screen, Text } from '@/shared/ui';

import { ChildProfileModal } from '../components/ChildProfileModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { WithdrawModal } from '../components/WithdrawModal';

type OpenModal = 'profile' | 'logout' | 'withdraw' | null;

/**
 * 마이페이지.
 *
 * 화면 자체는 아직 디자인이 없어 최소 구성으로 두고, 디자인이 나와 있는
 * 모달 3개(아이 프로필 전환 / 로그아웃 / 회원탈퇴)를 붙여둔다.
 * 디자인이 오면 이 화면의 본문만 갈아끼우면 된다.
 */
export function MypageScreen(): React.JSX.Element {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(MOCK_CHILDREN[0]?.id ?? null);

  const activeChild = MOCK_CHILDREN.find((child) => child.id === activeChildId);
  const close = (): void => setOpenModal(null);

  return (
    <Screen scrollable>
      <View style={styles.page}>
        <Appear>
          <Text variant="title">마이페이지</Text>
        </Appear>

        <Appear delay={40}>
          <Card flat>
            <Text variant="heading">지금 사용 중인 아이</Text>
            <PressableScale
              accessibilityRole="button"
              onPress={() => setOpenModal('profile')}
              style={styles.childRow}
            >
              {activeChild !== undefined && (
                <>
                  {(() => {
                    const { Icon } = findAvatar(activeChild.avatarId);
                    return <Icon width={48} height={48} />;
                  })()}
                  <Text variant="label">{activeChild.name}</Text>
                </>
              )}
              <Text variant="caption" color="primaryText" style={styles.changeLabel}>
                바꾸기
              </Text>
            </PressableScale>
          </Card>
        </Appear>

        <Appear delay={80} style={styles.actions}>
          <Button label="로그아웃" variant="secondary" onPress={() => setOpenModal('logout')} />
          <Button label="회원탈퇴" variant="ghost" onPress={() => setOpenModal('withdraw')} />
        </Appear>
      </View>

      <ChildProfileModal
        visible={openModal === 'profile'}
        profiles={MOCK_CHILDREN}
        activeId={activeChildId}
        onSelect={setActiveChildId}
        onAdd={() => {
          close();
          router.push('/child/create');
        }}
        onClose={close}
      />

      <ConfirmModal
        visible={openModal === 'logout'}
        title="로그아웃 할까요?"
        description="다시 로그인하면 이어서 사용할 수 있어요"
        confirmLabel="로그아웃"
        onConfirm={() => {
          close();
          // TODO: 토큰 삭제 후 로그인으로
          router.replace('/');
        }}
        onCancel={close}
      />

      <WithdrawModal
        visible={openModal === 'withdraw'}
        onConfirm={() => {
          close();
          // TODO: 회원탈퇴 API (soft delete)
          router.replace('/');
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
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  changeLabel: {
    marginLeft: 'auto',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
});
