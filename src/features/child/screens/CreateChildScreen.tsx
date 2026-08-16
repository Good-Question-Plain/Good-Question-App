import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { useCreateChild, useUpdateChild } from '../api/queries';
import { useActiveChild } from '../hooks/useActiveChild';
import { usePickProfileImage } from '../hooks/usePickProfileImage';
import { useActiveChildStore } from '../model/activeChildStore';
import { FALLBACK_AVATAR_ID } from '../model/types';

/**
 * 아이 프로필 만들기 / 수정 (Figma 92:808).
 *
 * 아바타 8종 + "사진 올리기" 자리를 5열로 놓고, 아래에 이름과 버튼.
 * 보호자 한 계정에 아이를 여러 명 등록할 수 있어서(PRD 5.1) 이 화면은
 * 최초 등록과 추가 등록 양쪽에서 재사용된다.
 *
 * ## 수정 모드
 *
 * 라우트에 `?id=` 가 붙어 오면 **그 아이를 고치는 화면**이 된다
 * (마이페이지의 연필 버튼). 예전에는 연필도 이 화면을 그냥 열어서
 * **고치려다 새 아이가 하나 더 만들어졌다.**
 *
 * **수정 화면 시안은 아직 없다.** 만들기 시안을 그대로 쓰고 제목·버튼 문구만
 * 바꿨다 — 시안이 나오면 교체 대상이다.
 */
export function CreateChildScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { children } = useActiveChild();

  const editing = children.find((child) => child.id === id);
  const isEdit = editing !== undefined;

  const [avatarId, setAvatarId] = useState<AvatarId>(editing?.avatarId ?? FALLBACK_AVATAR_ID);
  const [name, setName] = useState(editing?.name ?? '');
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const { selectChild } = useActiveChildStore();
  const photo = usePickProfileImage();

  /**
   * 수정 중인 아이가 이미 올려둔 사진.
   *
   * **아바타를 새로 고르거나 사진을 새로 고르기 전까지는 이게 유지된다.**
   * 이름만 고치러 들어온 사람이 사진을 잃으면 안 된다.
   */
  const savedPhotoUrl = isEdit ? editing.photoUrl : null;

  /** 이번에 아바타를 직접 골랐는지. 저장된 사진을 아바타로 바꾸겠다는 뜻이다. */
  const [avatarChosen, setAvatarChosen] = useState(false);

  /**
   * 프로필 그림을 이번에 실제로 바꿨는지.
   *
   * **바꾸지 않았으면 서버로 `profile_image_url` 을 아예 안 보낸다.** 안 그러면
   * 사진을 올려둔 아이를 이름만 고쳐도 `avatar:bear` 표식이 덮어써서 **사진이
   * 사라진다.** `PATCH` 는 보낸 항목만 바꾸므로 빼는 것이 곧 유지다.
   *
   * 사진 선택기를 열었다가 **취소한 경우는 바꾼 것이 아니다** — 그래서 "열었는지"가
   * 아니라 "골랐는지"(`photo.picked`)로 판단한다.
   */
  const imageTouched = avatarChosen || photo.picked !== null;

  /** 지금 프로필 그림이 사진인지. 새로 고른 것이든 저장돼 있던 것이든. */
  const hasPhoto = photo.picked !== null || (!avatarChosen && savedPhotoUrl !== null);

  // 목록이 늦게 도착해도 입력칸이 채워지도록 한 번만 맞춘다. 사용자가 이미
  // 고쳐 놓은 값을 덮어쓰면 안 되므로 "아직 비어 있을 때"만 넣는다.
  const [seeded, setSeeded] = useState(false);
  if (isEdit && !seeded) {
    setSeeded(true);
    setName(editing.name);
    setAvatarId(editing.avatarId ?? FALLBACK_AVATAR_ID);
  }

  const pending = createChild.isPending || updateChild.isPending;
  const failed = createChild.isError || updateChild.isError;

  const handleSubmit = (): void => {
    if (pending) return;

    if (isEdit) {
      updateChild.mutate(
        {
          childId: editing.id,
          name,
          // 손대지 않았으면 둘 다 빼서 지금 그림을 그대로 둔다 (위 주석 참고).
          ...(imageTouched ? (photo.picked !== null ? { photo: photo.picked } : { avatarId }) : {}),
        },
        { onSuccess: () => router.back() },
      );
      return;
    }

    createChild.mutate(
      { name, avatarId, photo: photo.picked ?? undefined },
      {
        onSuccess: (child) => {
          // 방금 만든 아이를 바로 활성으로 둔다. 선택 화면에서 다시 찾아
          // 누르게 하면 등록했는데 아무 일도 안 일어난 것처럼 보인다.
          selectChild(child.id);
          router.replace('/child/select');
        },
      },
    );
  };

  return (
    <AuthCard showBrand={false} style={styles.card}>
      <View style={styles.header}>
        <Text variant="title" align="center">
          {isEdit ? '아이 프로필을 수정해주세요' : '아이 프로필을 만들어주세요'}
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
            // 사진(새로 고른 것이든 저장돼 있던 것이든)이 있으면 아바타 선택은
            // 해제된 것으로 보인다 — 둘 중 하나만 프로필 그림이 된다.
            selected={!hasPhoto && avatar.id === avatarId}
            onPress={() => {
              setAvatarId(avatar.id);
              photo.clear();
              // 아바타를 고른 것은 "그림을 바꾸겠다"는 뜻이다. 저장된 사진이
              // 있었다면 이 선택으로 대체된다.
              setAvatarChosen(true);
            }}
            style={styles.gridItem}
          />
        ))}
        {/*
          수정 중인 아이가 이미 사진을 올려뒀으면 **그 사진을 여기에 그대로 띄운다.**
          빈 카메라 칸만 보이면 "사진이 날아갔나" 싶어서 굳이 다시 올리게 된다.
        */}
        <AvatarOption
          label={hasPhoto ? '사진 바꾸기' : '사진 올리기'}
          Icon={CameraIcon}
          imageUri={photo.picked?.uri ?? savedPhotoUrl ?? undefined}
          dashed
          selected={hasPhoto}
          onPress={() => void photo.pick()}
          style={styles.gridItem}
        />
      </View>

      <Input
        placeholder="아이 이름"
        value={name}
        onChangeText={(next) => {
          setName(next);
          if (createChild.isError) createChild.reset();
          if (updateChild.isError) updateChild.reset();
        }}
        maxLength={20}
        status={failed ? 'error' : 'default'}
        helperText={
          failed
            ? isEdit
              ? '아이 정보를 수정하지 못했어요. 잠시 후 다시 시도해주세요.'
              : '아이를 등록하지 못했어요. 잠시 후 다시 시도해주세요.'
            : undefined
        }
        editable={!pending}
        onSubmitEditing={handleSubmit}
      />

      <Button
        label={isEdit ? '수정 완료' : '등록 완료'}
        fullWidth
        size="lg"
        disabled={name.trim().length === 0}
        loading={pending}
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
