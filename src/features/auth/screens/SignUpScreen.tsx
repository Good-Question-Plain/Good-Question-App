import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import {
  Appear,
  AuthCard,
  Button,
  CelebrateIcon,
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

type Step = 1 | 2 | 3 | 4;

/**
 * 회원가입 (Figma 86:579).
 *
 * 이메일 → 인증코드 → 비밀번호 → 완료 4단계가 카드 하나 안에서 교체된다.
 * 단계 상태는 화면 안에만 있고, 실제 인증/가입은 백엔드 API 가 나오면 붙인다.
 */
export function SignUpScreen(): React.JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const expiry = useCountdown(CODE_TTL_SECONDS);
  const resend = useCountdown(RESEND_COOLDOWN_SECONDS);

  const handleSendCode = (): void => {
    // TODO: 인증코드 발송 API
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

  return (
    <AuthCard>
      {step < 4 && <StepIndicator total={3} current={step} style={styles.steps} />}

      {step === 1 && (
        <Appear key="step1" style={styles.step}>
          <Text variant="heading">이메일을 입력해주세요</Text>
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
            <Text variant="caption" color="textMuted">
              이미 계정이 있으신가요?{' '}
            </Text>
            <PressableScale accessibilityRole="link" scaleTo={0.94} onPress={() => router.back()}>
              <Text variant="caption" color="primaryText">
                로그인
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
          <Text variant="heading">비밀번호를 설정해주세요</Text>
          <PasswordFields
            password={password}
            onPasswordChange={setPassword}
            confirm={confirm}
            onConfirmChange={setConfirm}
          />
          <Button
            label="가입 완료"
            fullWidth
            size="lg"
            disabled={!isValidPassword(password) || password !== confirm}
            onPress={() => setStep(4)}
          />
        </Appear>
      )}

      {step === 4 && (
        <Appear key="step4" from="scale" style={styles.done}>
          {/* 장식용 점 3개 — 디자인 실측 위치 */}
          <View style={[styles.dot, styles.dotTopLeft]} />
          <View style={[styles.dot, styles.dotTopRight]} />
          <View style={[styles.dot, styles.dotBottomLeft]} />

          <View style={styles.celebrateCircle}>
            <CelebrateIcon width={56} height={56} />
          </View>
          <Text variant="title" color="primaryTextDeep" align="center">
            굿 퀘스천에 오신 걸 환영해요!
          </Text>
          <Text variant="body" color="textMuted" align="center">
            이제 아이를 등록해주세요
          </Text>
          <Button
            label="아이 등록하기"
            fullWidth
            size="lg"
            onPress={() => router.replace('/child/create')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  done: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  celebrateCircle: {
    width: 120, // 디자인 실측
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
    backgroundColor: colors.success,
  },
  dot: {
    position: 'absolute',
  },
  dotTopLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.decorMid,
    left: 12,
    top: 0,
  },
  dotTopRight: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primarySoft,
    right: 24,
    top: 8,
  },
  dotBottomLeft: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.decorLight,
    left: 0,
    top: 120,
  },
});
