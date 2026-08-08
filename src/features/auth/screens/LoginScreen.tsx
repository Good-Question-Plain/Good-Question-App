import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, motion, radius, spacing } from '@/shared/theme';
import {
  Appear,
  Button,
  Divider,
  Input,
  PressableScale,
  Screen,
  SocialButton,
  Text,
  type SocialProvider,
} from '@/shared/ui';

/**
 * 로그인 화면 (Figma 10:1100).
 *
 * 지금은 화면만 붙인 상태로, 실제 인증은 백엔드 API 가 나오면 `api/` 에 붙인다.
 *
 * 진입할 때 로고 → 폼 → 소셜 → 하단 링크 순으로 짧게 순차 등장한다.
 * 시선이 위에서 아래로 자연스럽게 흐르게 하려는 것이고, 전체가 240ms 안에
 * 끝나서 기다린다는 느낌은 주지 않는다.
 */
export function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = (): void => {
    // TODO: 로그인 API 연동
  };

  const handleSocialPress = (_provider: SocialProvider): void => {
    // TODO: 소셜 로그인 연동
  };

  // 태블릿 소프트 키보드는 화면 절반가량을 덮는다. scrollable 로 두지 않으면
  // 키보드가 올라온 동안 "계속하기" 버튼에 손이 닿지 않는다.
  return (
    <Screen padded={false} scrollable>
      <View style={styles.page}>
        <Appear style={styles.brand}>
          <Text variant="brand" color="primary">
            굿 퀘스천
          </Text>
          <Text variant="subtitle" color="textMuted">
            아이와 함께하는 이야기 대화
          </Text>
        </Appear>

        <Appear style={styles.card} delay={motion.stagger}>
          <View style={styles.form}>
            <Input
              label="이메일"
              placeholder="이메일을 입력하세요"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Input
              label="비밀번호"
              placeholder="비밀번호을 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
            />
            <Button label="계속하기" fullWidth disabled={!canSubmit} onPress={handleSubmit} />
          </View>

          <Divider label="또는" />

          <Appear style={styles.socials} delay={motion.stagger * 2}>
            <SocialButton provider="google" onPress={() => handleSocialPress('google')} />
            <SocialButton provider="kakao" onPress={() => handleSocialPress('kakao')} />
            <SocialButton provider="naver" onPress={() => handleSocialPress('naver')} />
          </Appear>
        </Appear>

        <Appear style={styles.footer} delay={motion.stagger * 3}>
          <PressableScale
            accessibilityRole="link"
            scaleTo={0.94}
            onPress={() => router.push('/signup')}
          >
            <Text variant="button" color="primaryText">
              굿 퀘스천이 처음이신가요?
            </Text>
          </PressableScale>
          <Text variant="button" color="primaryText">
            |
          </Text>
          <PressableScale
            accessibilityRole="link"
            scaleTo={0.94}
            onPress={() => router.push('/find-password')}
          >
            <Text variant="button" color="primaryText">
              비밀번호를 잃어버리셨나요?
            </Text>
          </PressableScale>
        </Appear>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    // Screen 의 scrollable 경로에 맞춰 flexGrow 를 쓴다 (flex:1 이면 스크롤이 안 생긴다).
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing['2xl'],
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['4xl'],
    paddingHorizontal: 150, // 디자인 실측 (1024 기준 좌우 여백)
  },
  brand: {
    alignItems: 'center',
    gap: spacing.md,
  },
  card: {
    flexGrow: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: 50, // 디자인 실측
    paddingVertical: 30, // 디자인 실측
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAccent,
  },
  form: {
    gap: 15, // 디자인 실측
  },
  socials: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
