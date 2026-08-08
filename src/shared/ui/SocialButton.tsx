import { useState } from 'react';
import { Image, type PressableProps, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

import { googleLogo, KakaoLogo, NaverLogo } from './icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type SocialProvider = 'google' | 'kakao' | 'naver';

export interface SocialButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  provider: SocialProvider;
}

const LABEL: Record<SocialProvider, string> = {
  google: 'Google로 계속하기',
  kakao: '카카오로 계속하기',
  naver: '네이버로 계속하기',
};

/**
 * 소셜 로그인 버튼.
 *
 * 로고는 Figma 에서 내보낸 에셋을 그대로 쓴다. 구글만 PNG 이고 카카오·네이버는
 * 브랜드 색이 박힌 SVG 라, 구글은 흰 원형 테두리 안에 넣어 세 개의 크기를 맞춘다.
 */
export function SocialButton({
  provider,
  onPressIn,
  onPressOut,
  ...rest
}: SocialButtonProps): React.JSX.Element {
  const [pressed, setPressed] = useState(false);

  return (
    <PressableScale
      accessibilityRole="button"
      style={[styles.button, pressed && styles.pressed]}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      {...rest}
    >
      <View style={styles.logo}>
        {provider === 'google' && (
          <View style={styles.googleRing}>
            <Image source={googleLogo} style={styles.googleImage} resizeMode="contain" />
          </View>
        )}
        {provider === 'kakao' && <KakaoLogo width={30} height={30} />}
        {provider === 'naver' && <NaverLogo width={30} height={30} />}
      </View>

      <Text variant="body">{LABEL[provider]}</Text>
    </PressableScale>
  );
}

const LOGO_SIZE = 30;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 48,
    paddingLeft: 17, // 디자인 실측값
    paddingRight: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleRing: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  googleImage: {
    // 링 안쪽 7px 패딩을 뺀 크기 (디자인 실측)
    width: LOGO_SIZE - 14,
    height: LOGO_SIZE - 14,
  },
});
