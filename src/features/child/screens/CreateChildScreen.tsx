import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import {
  AuthCard,
  AVATARS,
  AvatarOption,
  Button,
  CameraIcon,
  Input,
  Text,
  type AvatarId,
} from '@/shared/ui';

/**
 * 아이 프로필 만들기 (Figma 92:808).
 *
 * 아바타 8종 + "사진 올리기" 자리를 5열로 놓고, 아래에 이름과 등록 버튼.
 * 보호자 한 계정에 아이를 여러 명 등록할 수 있어서(PRD 5.1) 이 화면은
 * 최초 등록과 추가 등록 양쪽에서 재사용된다.
 */
export function CreateChildScreen(): React.JSX.Element {
  const router = useRouter();
  const [avatarId, setAvatarId] = useState<AvatarId>('bear');
  const [name, setName] = useState('');

  const handleSubmit = (): void => {
    // TODO: 아이 등록 API
    router.replace('/child/select');
  };

  return (
    <AuthCard showBrand={false} style={styles.card}>
      <View style={styles.header}>
        <Text variant="title" align="center">
          아이 프로필을 만들어주세요
        </Text>
        <Text variant="caption" color="textMuted" align="center">
          아바타와 이름을 선택해주세요
        </Text>
      </View>

      <View style={styles.grid}>
        {AVATARS.map((avatar, index) => (
          <AvatarOption
            key={avatar.id}
            label={avatar.label}
            Icon={avatar.Icon}
            tintIndex={index}
            selected={avatar.id === avatarId}
            onPress={() => setAvatarId(avatar.id)}
            style={styles.gridItem}
          />
        ))}
        <AvatarOption
          label="사진 올리기"
          Icon={CameraIcon}
          dashed
          style={styles.gridItem}
          // TODO: 이미지 선택기 연동 (expo-image-picker)
        />
      </View>

      <Input placeholder="아이 이름" value={name} onChangeText={setName} maxLength={20} />

      <Button
        label="등록 완료"
        fullWidth
        size="lg"
        disabled={name.trim().length === 0}
        onPress={handleSubmit}
      />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 620, // 디자인 실측 (아바타 5열이 들어가야 해서 다른 auth 카드보다 넓다)
  },
  header: {
    gap: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing['2xl'],
  },
  /**
   * 디자인은 5열 고정이다. 폭을 20% 로 못 박지 않으면 flexWrap 이 남는 공간에
   * 맞춰 한 줄에 더 밀어넣어 열 수가 화면 폭마다 달라진다.
   */
  gridItem: {
    width: '20%',
  },
});
