import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, hitSlopFor, radius, spacing } from '@/shared/theme';

import { type AvatarId } from './avatars';
import { Button } from './Button';
import { CloseIcon, PlusIcon } from './icons';
import { InitialBadge } from './InitialBadge';
import { Modal } from './Modal';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/**
 * 이 모달이 아이에 대해 알아야 하는 최소한.
 *
 * `@/features/child` 의 `Child` 를 직접 가져오지 않는다 — feature 끼리 의존하면
 * 순환 참조가 생기고 한쪽을 고칠 때 다른 쪽이 딸려온다. 구조가 같으니 호출부에서
 * `Child[]` 를 그대로 넘길 수 있다.
 */
export interface ChildProfileSummary {
  id: string;
  name: string;
  avatarId: AvatarId;
  /**
   * 아이가 직접 올린 사진. 있으면 **이름 뱃지 대신 이 사진을 그린다.**
   *
   * 시안(86:734)은 첫 글자 뱃지만 그려져 있는데, 사진을 올린 아이까지 글자로
   * 덮으면 "내가 올린 사진이 어디 갔지"가 된다. 사진이 있으면 사진이 우선이다.
   */
  photoUrl?: string | null;
}

export interface ChildProfileModalProps {
  visible: boolean;
  profiles: readonly ChildProfileSummary[];
  /** 현재 사용 중인 아이 */
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  /**
   * 닫기.
   *
   * **넘기지 않으면 X 와 배경 누르기가 사라진다.** 로그인 직후처럼 아이를 고르기
   * 전에는 돌아갈 데가 없어서, 닫을 수 있게 두면 아무것도 못 하는 화면에 갇힌다.
   */
  onClose?: () => void;
}

/** 아바타 지름. 디자인 실측 (86:743). */
const AVATAR_SIZE = 72;

/**
 * 아이 프로필 선택 모달 (Figma 86:734).
 *
 * 보호자 한 계정에 아이가 여러 명일 수 있어서(PRD 5.1) 매번 로그아웃하지 않고
 * 여기서 갈아탈 수 있어야 한다.
 *
 * 시안 실측: 카드 480×412 · 안쪽 여백 24 · 아바타 72(이름은 아래) ·
 * 버튼 432×52. 아바타는 그림이 아니라 **이름 첫 글자 뱃지**다.
 */
export function ChildProfileModal({
  visible,
  profiles,
  activeId,
  onSelect,
  onAdd,
  onClose,
}: ChildProfileModalProps): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(activeId);

  // 열릴 때마다 "지금 쓰는 아이"로 되돌린다. 고르다 취소하고 다시 열었을 때 이전
  // 선택이 남아 있으면, 화면은 지오인데 모달은 하윤이 골라진 상태가 된다.
  // 그대로 "변경하기"를 누르면 아이가 의도치 않게 바뀐다.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setSelectedId(activeId);
  }

  const handleConfirm = (): void => {
    if (selectedId !== null) onSelect(selectedId);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      dismissOnBackdropPress={onClose !== undefined}
      width={480} // 디자인 실측
      cardStyle={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="heading">아이 프로필 선택</Text>
          <Text variant="caption" color="textMuted">
            누구의 이야기를 이어갈까요?
          </Text>
        </View>

        {onClose !== undefined && (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="닫기"
            onPress={onClose}
            scaleTo={0.9}
            hitSlop={hitSlopFor(24)}
          >
            <CloseIcon width={18} height={18} color={colors.textStrong} />
          </PressableScale>
        )}
      </View>

      <View style={styles.row}>
        {profiles.map((profile, index) => (
          <PressableScale
            key={profile.id}
            accessibilityRole="button"
            accessibilityLabel={profile.name}
            accessibilityState={{ selected: profile.id === selectedId }}
            onPress={() => setSelectedId(profile.id)}
            scaleTo={0.94}
            style={styles.cell}
          >
            <InitialBadge
              name={profile.name}
              size={AVATAR_SIZE}
              tintIndex={index}
              photoUrl={profile.photoUrl}
              style={profile.id === selectedId ? styles.badgeSelected : undefined}
            />
            <Text variant="captionSmall">{profile.name}</Text>
          </PressableScale>
        ))}

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="아이 추가하기"
          onPress={onAdd}
          scaleTo={0.94}
          style={styles.cell}
        >
          <View style={styles.addCircle}>
            <PlusIcon width={22} height={22} color={colors.textSubtle} />
          </View>
          <Text variant="captionSmall" color="textMuted">
            아이 추가하기
          </Text>
        </PressableScale>
      </View>

      <Button
        label="변경하기"
        fullWidth
        size="lg"
        style={styles.cta}
        disabled={selectedId === null}
        onPress={handleConfirm}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24, // 디자인 실측 (Modal 기본 28 과 다르다)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    gap: spacing.xs,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    // 시안은 한 줄에 3개, 넘치면 다음 줄로 내려간다 (추가하기가 둘째 줄에 있다).
    flexWrap: 'wrap',
    gap: 30, // 디자인 실측 (아바타 사이 간격)
  },
  cell: {
    width: AVATAR_SIZE,
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  addCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  cta: {
    height: 52, // 디자인 실측. Button 의 어느 size 보다 커서 직접 지정한다.
  },
});
