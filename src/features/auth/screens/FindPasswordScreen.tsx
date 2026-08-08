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
import { useCountdown } from '../model/useCountdown';

/** PRD: 인증코드 만료 5분, 재발송 대기 1분. */
const CODE_TTL_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

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

  const handleSendCode = (): void => {
    // TODO: 비밀번호 재설정 인증코드 발송 API
    expiry.restart();
    resend.restart();
    setStep(2);
  };

  const handleResend = (): void => {
    if (resend.isRunning) return;
    // TODO: 인증코드 재발송 API
    expiry.restart();
    resend.restart();
    setCode('');
  };

  const handleReset = (): void => {
    // TODO: 비밀번호 재설정 API
    router.replace('/');
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
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Button
            label="인증코드 발송"
            fullWidth
            size="lg"
            disabled={email.trim().length === 0}
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

          <OtpInput length={CODE_LENGTH} value={code} onChange={setCode} />

          <View style={styles.resendRow}>
            <PressableScale
              accessibilityRole="button"
              scaleTo={0.94}
              disabled={resend.isRunning}
              onPress={handleResend}
            >
              <Text variant="caption" color={resend.isRunning ? 'disabledText' : 'primaryText'}>
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
            onPress={() => setStep(3)}
          />
        </Appear>
      )}

      {step === 3 && (
        <Appear key="step3" style={styles.step}>
          <Text variant="heading">새 비밀번호를 설정해주세요</Text>
          <PasswordFields
            password={password}
            onPasswordChange={setPassword}
            confirm={confirm}
            onConfirmChange={setConfirm}
          />
          <Button
            label="비밀번호 변경 완료"
            fullWidth
            size="lg"
            disabled={!isValidPassword(password) || password !== confirm}
            onPress={handleReset}
          />
        </Appear>
      )}
    </AuthCard>
  );
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
