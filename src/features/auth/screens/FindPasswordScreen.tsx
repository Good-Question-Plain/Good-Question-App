import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import {
  Appear,
  AuthCard,
  Button,
  Input,
  OtpInput,
  PressableScale,
  StepIndicator,
  Text,
} from '@/shared/ui';

import { isValidPassword, PasswordFields } from '../components/PasswordFields';
import { useResetPassword, useSendEmailCode, useVerifySignUpCode } from '../hooks/useSignUp';
import { authErrorMessage } from '../model/authErrors';
import { useCountdown } from '../model/useCountdown';

/** 회원가입과 같은 값이다 (`SignUpScreen` 주석에 왜 10분인지 적어뒀다). */
const CODE_TTL_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
/** 회원가입과 같은 이유로 8이다 (`SignUpScreen` 주석 참고). */
const CODE_LENGTH = 8;

type Step = 1 | 2 | 3;

/**
 * 비밀번호 찾기 (Figma 86:665 / 86:683 / 86:708).
 *
 * 이메일 → 인증코드 → 새 비밀번호. 회원가입과 단계 구성이 거의 같지만
 * 마지막이 "가입"이 아니라 "재설정"이고 완료 화면이 없다는 점이 다르다.
 * 두 화면을 억지로 하나로 합치면 분기가 더 늘어나서 따로 뒀다.
 */
export function FindPasswordScreen(): React.JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const expiry = useCountdown(CODE_TTL_SECONDS);
  const resend = useCountdown(RESEND_COOLDOWN_SECONDS);

  // 가입과 달리 `shouldCreateUser: false` 다 — 없는 이메일로 새 계정이 생기면
  // "재설정했는데 로그인이 안 되는" 계정이 만들어진다.
  const sendCode = useSendEmailCode(false);
  const verifyCode = useVerifySignUpCode();
  const reset = useResetPassword();

  const sendError = sendCode.isError ? sendCodeErrorMessage(sendCode.error) : undefined;
  const verifyError = verifyCode.isError
    ? authErrorMessage(verifyCode.error, '인증코드를 확인하지 못했습니다. 다시 시도해주세요.')
    : undefined;
  const resetError = reset.isError
    ? authErrorMessage(reset.error, '비밀번호를 바꾸지 못했습니다. 다시 시도해주세요.')
    : undefined;

  const handleSendCode = (): void => {
    if (sendCode.isPending) return;

    sendCode.mutate(email, {
      // 타이머는 메일이 실제로 나간 뒤에 시작한다.
      onSuccess: () => {
        expiry.restart();
        resend.restart();
        setCode('');
        setStep(2);
      },
    });
  };

  const handleResend = (): void => {
    if (resend.isRunning || sendCode.isPending) return;

    verifyCode.reset();
    sendCode.mutate(email, {
      onSuccess: () => {
        expiry.restart();
        resend.restart();
        setCode('');
      },
    });
  };

  const handleVerifyCode = (): void => {
    if (verifyCode.isPending) return;
    verifyCode.mutate({ email, token: code }, { onSuccess: () => setStep(3) });
  };

  const handleReset = (): void => {
    if (reset.isPending) return;

    reset.mutate(password, {
      onSuccess: () => {
        expiry.stop();
        resend.stop();
        // 코드 확인 시점에 이미 로그인된 상태다. 그대로 안쪽으로 보내도 되지만,
        // 방금 바꾼 비밀번호로 한 번 들어가 보게 하는 편이 덜 헷갈린다.
        router.replace('/');
      },
    });
  };

  return (
    <AuthCard>
      <StepIndicator total={3} current={step} style={styles.steps} />

      {step === 1 && (
        <Appear key="step1" style={styles.step}>
          <View>
            <Text variant="heading">가입한 이메일을 입력해주세요</Text>
            <Text variant="footnote" color="textMuted">
              인증코드를 보내드려요
            </Text>
          </View>
          <Input
            placeholder="이메일 주소"
            value={email}
            onChangeText={(next) => {
              setEmail(next);
              if (sendCode.isError) sendCode.reset();
            }}
            status={sendError === undefined ? 'default' : 'error'}
            helperText={sendError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!sendCode.isPending}
            onSubmitEditing={handleSendCode}
          />
          <Button
            label="인증코드 발송"
            fullWidth
            size="lg"
            disabled={email.trim().length === 0}
            loading={sendCode.isPending}
            onPress={handleSendCode}
          />
          <View style={styles.footnote}>
            <PressableScale accessibilityRole="link" scaleTo={0.94} onPress={() => router.back()}>
              <Text variant="caption" color="primaryText">
                로그인으로 돌아가기
              </Text>
            </PressableScale>
          </View>
        </Appear>
      )}

      {step === 2 && (
        <Appear key="step2" style={styles.step}>
          <View>
            <Text variant="heading">이메일로 보낸 인증코드를 입력해주세요</Text>
            <Text variant="footnote" color="textMuted">
              {email || 'example@email.com'}로 전송
            </Text>
          </View>

          <View style={styles.codeHeader}>
            <Text variant="caption" color="textStrong">
              인증코드
            </Text>
            <Text variant="caption" color="timer">
              {expiry.label}
            </Text>
          </View>

          <OtpInput
            length={CODE_LENGTH}
            value={code}
            onChange={(next) => {
              setCode(next);
              if (verifyCode.isError) verifyCode.reset();
            }}
          />

          {/* 코드 확인 실패와 재발송 실패가 같은 자리를 쓴다. 한 번에 하나만 난다. */}
          {(verifyError ?? sendError) !== undefined && (
            <Text variant="footnote" color="danger">
              {verifyError ?? sendError}
            </Text>
          )}

          <View style={styles.resendRow}>
            <PressableScale
              accessibilityRole="button"
              scaleTo={0.94}
              disabled={resend.isRunning || sendCode.isPending}
              onPress={handleResend}
            >
              <Text
                variant="caption"
                color={resend.isRunning || sendCode.isPending ? 'disabledText' : 'primaryText'}
              >
                코드 재발송
              </Text>
            </PressableScale>
            {resend.isRunning && (
              <Text variant="footnote" color="textSubtle">
                {resend.remaining}초 뒤 재발송 가능
              </Text>
            )}
          </View>

          <Button
            label="다음"
            fullWidth
            size="lg"
            disabled={code.length < CODE_LENGTH || !expiry.isRunning}
            loading={verifyCode.isPending}
            onPress={handleVerifyCode}
          />
        </Appear>
      )}

      {step === 3 && (
        <Appear key="step3" style={styles.step}>
          <Text variant="heading">새 비밀번호를 설정해주세요</Text>
          <PasswordFields
            password={password}
            onPasswordChange={(next) => {
              setPassword(next);
              if (reset.isError) reset.reset();
            }}
            confirm={confirm}
            onConfirmChange={setConfirm}
          />
          {resetError !== undefined && (
            <Text variant="footnote" color="danger">
              {resetError}
            </Text>
          )}
          <Button
            label="비밀번호 변경 완료"
            fullWidth
            size="lg"
            disabled={!isValidPassword(password) || password !== confirm}
            loading={reset.isPending}
            onPress={handleReset}
          />
        </Appear>
      )}
    </AuthCard>
  );
}

/**
 * 발송 실패 문구.
 *
 * **같은 `otp_disabled` 코드가 흐름에 따라 뜻이 다르다.** 회원가입
 * (`shouldCreateUser: true`)에서는 "OTP 가입이 꺼져 있다"는 콘솔 설정 문제지만,
 * 여기서는 `shouldCreateUser: false` 라 **"그 이메일로 가입된 계정이 없다"** 는
 * 뜻으로 온다. 기기에서 눌러보고 확인했다.
 *
 * 그래서 공용 문구를 그대로 쓰면 "지금은 인증코드로 가입할 수 없습니다"가 떠서
 * 보호자가 이메일을 다시 볼 생각을 못 한다.
 */
function sendCodeErrorMessage(error: unknown): string {
  if (error instanceof AuthError && error.code === 'otp_disabled') {
    return '가입되지 않은 이메일이에요. 다시 확인해주세요.';
  }
  return authErrorMessage(error, '인증코드를 보내지 못했습니다. 이메일을 확인해주세요.');
}

const styles = StyleSheet.create({
  steps: {
    alignSelf: 'center',
  },
  step: {
    gap: spacing.xl,
  },
  footnote: {
    alignItems: 'center',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
});
