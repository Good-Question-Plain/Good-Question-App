import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import {
  Appear,
  AvatarOption,
  Button,
  EmptyState,
  findAvatar,
  PlusIcon,
  Screen,
  Text,
} from '@/shared/ui';

import { useActiveChild } from '../hooks/useActiveChild';
import { FALLBACK_AVATAR_ID } from '../model/types';

/**
 * 아이 프로필 선택 (Figma 92:889).
 *
 * 아이가 직접 자기 얼굴을 고르는 화면이라 아바타를 크게 놓았다.
 * 마지막 칸은 아이 추가로, 프로필 만들기 화면으로 보낸다.
 *
 * 고른 아이는 전역 스토어에 남아 홈·리포트까지 그대로 이어진다.
 */
export function SelectChildScreen(): React.JSX.Element {
  const router = useRouter();
  const { activeChild, children, isLoading, isError, selectChild } = useActiveChild();

  const handleStart = (): void => {
    router.replace('/story');
  };

  // 아직 아이가 하나도 없으면 고를 게 없다 — 만들기 화면이 다음 단계다.
  // 가입 직후 첫 진입이 이 경우다.
  if (!isLoading && !isError && children.length === 0) {
    return (
      <Screen>
        <View style={styles.empty}>
          <EmptyState
            title="아직 등록된 아이가 없어요"
            description="아이를 등록하면 이야기를 시작할 수 있어요"
            style={styles.emptyText}
          />
          <Button label="아이 등록하기" size="lg" onPress={() => router.replace('/child/create')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <View style={styles.page}>
        <Appear style={styles.header}>
          <Text variant="title" align="center">
            누구의 이야기를 만나볼까요?
          </Text>
          <Text variant="caption" color="textMuted" align="center">
            아이를 선택해주세요
          </Text>
        </Appear>

        {isError ? (
          <EmptyState
            title="아이 목록을 불러오지 못했어요"
            description="연결 상태를 확인하고 다시 시도해주세요"
          />
        ) : (
          <Appear style={styles.row} delay={60}>
            {children.map((child, index) => (
              <AvatarOption
                key={child.id}
                label={child.name}
                Icon={findAvatar(child.avatarId ?? FALLBACK_AVATAR_ID).Icon}
                // 사진을 올린 아이는 아바타 대신 그 사진이 뜬다.
                imageUri={child.photoUrl ?? undefined}
                tintIndex={index}
                size={AVATAR_SIZE}
                selected={child.id === activeChild?.id}
                onPress={() => selectChild(child.id)}
              />
            ))}
            <AvatarOption
              label="추가하기"
              Icon={PlusIcon}
              dashed
              size={AVATAR_SIZE}
              onPress={() => router.push('/child/create')}
            />
          </Appear>
        )}

        <Appear delay={120}>
          <Button
            label="시작하기"
            size="lg"
            disabled={activeChild === undefined}
            onPress={handleStart}
            style={styles.cta}
          />
        </Appear>
      </View>
    </Screen>
  );
}

/** 디자인 실측: 4칸이 본문 폭에 꽉 차게 들어간다. */
const AVATAR_SIZE = 132;

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['4xl'],
    paddingVertical: spacing['4xl'],
  },
  header: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // 보호자 한 계정에 아이를 여러 명 등록할 수 있다(PRD 5.1).
    // 7명이 넘으면 한 줄에 다 못 들어가므로 줄바꿈시킨다.
    flexWrap: 'wrap',
    gap: 25, // 디자인 실측
  },
  cta: {
    paddingHorizontal: 108, // 디자인 실측
  },
  /** 디자인에 없는 상태다 — 아이가 하나도 없을 때 막다른 길이 되지 않게 직접 만들었다. */
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  emptyText: {
    flex: 0,
  },
});
