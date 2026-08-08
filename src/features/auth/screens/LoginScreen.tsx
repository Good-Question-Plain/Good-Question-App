import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import {
  Button,
  Divider,
  Input,
  Screen,
  SocialButton,
  Text,
  type SocialProvider,
} from '@/shared/ui';

/**
 * 로그인 화면 (Figma 10:1100).
 *
 * 지금은 화면만 붙인 상태로, 실제 인증은 백엔드 API 가 나오면 `api/` 에 붙인다.
 */
export function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = (): void => {
    // TODO: 로그인 API 연동
  };

  const handleSocialPress = (_provider: SocialProvider): void => {
    // TODO: 소셜 로그인 연동
  };

  return (
    <Screen padded={false}>
      <View style={styles.page}>
        <View style={styles.brand}>
          <Text variant="brand" color="primary">
            굿 퀘스천
          </Text>
          <Text variant="subtitle" color="textMuted">
            아이와 함께하는 이야기 대화
          </Text>
        </View>

        <View style={styles.card}>
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

          <View style={styles.socials}>
            <SocialButton provider="google" onPress={() => handleSocialPress('google')} />
            <SocialButton provider="kakao" onPress={() => handleSocialPress('kakao')} />
            <SocialButton provider="naver" onPress={() => handleSocialPress('naver')} />
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable accessibilityRole="link">
            <Text variant="button" color="primaryText">
              굿 퀘스천이 처음이신가요?
            </Text>
          </Pressable>
          <Text variant="button" color="primaryText">
            |
          </Text>
          <Pressable accessibilityRole="link">
            <Text variant="button" color="primaryText">
              비밀번호를 잃어버리셨나요?
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
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
    flex: 1,
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
