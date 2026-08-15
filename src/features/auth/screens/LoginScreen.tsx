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

import { useEmailLogin } from '../hooks/useEmailLogin';
import { authErrorMessage } from '../model/authErrors';

/**
 * 로그인 화면 (Figma 10:1100).
 *
 * 이메일/비밀번호는 Supabase 로 직접 보낸다 (`useEmailLogin`). 우리 백엔드에는
 * 로그인 엔드포인트가 없다 — 서버는 Supabase 가 발급한 JWT 를 검증만 한다.
 *
 * 진입할 때 로고 → 폼 → 소셜 → 하단 링크 순으로 짧게 순차 등장한다.
 * 시선이 위에서 아래로 자연스럽게 흐르게 하려는 것이고, 전체가 240ms 안에
 * 끝나서 기다린다는 느낌은 주지 않는다.
 */
export function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useEmailLogin();

  const canSubmit = email.trim().length > 0 && password.length > 0;
  // 디자인에 에러 시안이 없다. 새 문구줄을 만들어 레이아웃을 밀어내는 대신
  // 이미 있는 Input 의 error 상태를 쓴다. 어느 쪽이 틀렸는지는 알려주지 않으므로
  // (계정 존재 여부가 새어나간다) 문구는 비밀번호 칸 아래 한 번만 띄운다.
  const errorMessage = login.isError
    ? authErrorMessage(login.error, '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
    : undefined;

  const handleSubmit = (): void => {
    if (!canSubmit || login.isPending) return;

    login.mutate(
      { email, password },
      {
        // 로그인 화면으로 되돌아올 수 없게 replace 로 바꿔치운다.
        // 아이를 고르는 화면이 다음 단계다 (가입 직후라면 아이 등록으로 간다).
        onSuccess: () => router.replace('/child/select'),
      },
    );
  };

  /** 입력을 고치면 이전 실패 표시를 지운다. 빨간 테두리가 남아 있으면 다시 눌러도 고쳐진 건지 알 수 없다. */
  const clearError = (): void => {
    if (login.isError) login.reset();
  };

  const handleSocialPress = (_provider: SocialProvider): void => {
    // TODO: 소셜 로그인 연동 (supabase.auth.signInWithOAuth + goodquestion://oauth 딥링크).
    // 콘솔에 어떤 provider 가 Enabled 인지, Redirect URL 이 등록됐는지 확인이 먼저다.
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
              onChangeText={(next) => {
                setEmail(next);
                clearError();
              }}
              status={errorMessage === undefined ? 'default' : 'error'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!login.isPending}
              onSubmitEditing={handleSubmit}
            />
            <Input
              label="비밀번호"
              placeholder="비밀번호을 입력하세요"
              value={password}
              onChangeText={(next) => {
                setPassword(next);
                clearError();
              }}
              status={errorMessage === undefined ? 'default' : 'error'}
              helperText={errorMessage}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              editable={!login.isPending}
              onSubmitEditing={handleSubmit}
            />
            <Button
              label="계속하기"
              fullWidth
              disabled={!canSubmit}
              loading={login.isPending}
              onPress={handleSubmit}
            />
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
