import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/shared/theme';

export interface TextProps extends RNTextProps {
  /** 타이포그래피 토큰. 기본값은 본문(body). */
  variant?: TypographyVariant;
  /** 색상 토큰. 임의의 hex 대신 토큰 이름을 쓴다. */
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
}

/**
 * 앱의 기본 텍스트.
 *
 * 화면 코드에서 react-native 의 `Text` 를 직접 쓰지 말고 이걸 쓴다.
 * fontSize / fontWeight 를 개별 화면이 정하기 시작하면 금방 제각각이 된다.
 */
export function Text({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: TextProps): React.JSX.Element {
  return (
    <RNText
      style={[typography[variant], { color: colors[color] }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
