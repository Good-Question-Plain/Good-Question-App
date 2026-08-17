import { Image, StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';

import { avatarTints, radius, type ColorToken } from '@/shared/theme';

import { Text } from './Text';

export interface InitialBadgeProps {
  /** 표시할 이름. 첫 글자만 쓴다. */
  name: string;
  size?: number;
  /** 배경 톤을 고르는 값. 목록에서의 순서를 그대로 넣으면 된다. */
  tintIndex?: number;
  /** 글자색. 대화 화면의 등장인물 뱃지처럼 진한 주황을 쓰는 곳이 있다. */
  color?: ColorToken;
  /**
   * 직접 올린 프로필 사진. **있으면 첫 글자 대신 이 사진을 그린다.**
   *
   * 사진을 올려둔 아이를 이름 글자로 덮으면 "내가 올린 사진이 어디 갔지"가 된다.
   * 사진이 우선이고, 없을 때만 글자 뱃지로 떨어진다.
   */
  photoUrl?: string | null;
  style?: ViewStyle;
}

/**
 * 이름 첫 글자를 담은 원형 뱃지.
 *
 * 마이페이지의 보호자·아이 카드는 아바타 그림 대신 이 뱃지를 쓴다
 * (디자인 234:567). 아바타 그림이 없는 보호자에게도 같은 형태를 적용할 수 있다.
 */
export function InitialBadge({
  name,
  size = 40,
  tintIndex = 0,
  color = 'text',
  photoUrl,
  style,
}: InitialBadgeProps): React.JSX.Element {
  const tint = avatarTints[tintIndex % avatarTints.length];
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (photoUrl !== undefined && photoUrl !== null && photoUrl.length > 0) {
    return (
      <Image
        source={{ uri: photoUrl }}
        // 호출부가 넘기는 style 은 테두리·크기 정도라 그대로 쓸 수 있다.
        style={[shape, style as ImageStyle]}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={[styles.badge, shape, { backgroundColor: tint }, style]}>
      <Text variant={labelVariant(size)} color={color}>
        {name.slice(0, 1)}
      </Text>
    </View>
  );
}

/**
 * 뱃지가 작아지면 글자도 같이 줄인다. 경계값은 디자인 실측이다 —
 * 52(마이페이지 보호자) / 40(아이 카드) / 26(홈 아이 전환 알약).
 */
function labelVariant(size: number): 'heading' | 'badgeLarge' | 'badge' {
  if (size >= 52) return 'heading';
  if (size >= 32) return 'badgeLarge';
  return 'badge';
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
});
