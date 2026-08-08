import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Appear, AvatarOption, Button, findAvatar, PlusIcon, Screen, Text } from '@/shared/ui';

import { MOCK_CHILDREN } from '../model/types';

/**
 * 아이 프로필 선택 (Figma 92:889).
 *
 * 아이가 직접 자기 얼굴을 고르는 화면이라 아바타를 크게 놓았다.
 * 마지막 칸은 아이 추가로, 프로필 만들기 화면으로 보낸다.
 */
export function SelectChildScreen(): React.JSX.Element {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_CHILDREN[0]?.id ?? null);

  const handleStart = (): void => {
    // TODO: 선택한 아이를 활성 프로필로 저장
    router.replace('/story');
  };

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

        <Appear style={styles.row} delay={60}>
          {MOCK_CHILDREN.map((child, index) => (
            <AvatarOption
              key={child.id}
              label={child.name}
              Icon={findAvatar(child.avatarId).Icon}
              tintIndex={index}
              size={AVATAR_SIZE}
              selected={child.id === selectedId}
              onPress={() => setSelectedId(child.id)}
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

        <Appear delay={120}>
          <Button
            label="시작하기"
            size="lg"
            disabled={selectedId === null}
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
});
