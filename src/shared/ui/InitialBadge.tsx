import { StyleSheet, View, type ViewStyle } from 'react-native';

import { avatarTints, radius } from '@/shared/theme';

import { Text } from './Text';

export interface InitialBadgeProps {
  /** 표시할 이름. 첫 글자만 쓴다. */
  name: string;
  size?: number;
  /** 배경 톤을 고르는 값. 목록에서의 순서를 그대로 넣으면 된다. */
  tintIndex?: number;
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
  style,
}: InitialBadgeProps): React.JSX.Element {
  const tint = avatarTints[tintIndex % avatarTints.length];

  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tint },
        style,
      ]}
    >
      <Text variant={labelVariant(size)}>{name.slice(0, 1)}</Text>
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
