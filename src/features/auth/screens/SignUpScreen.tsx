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
import { useCompleteSignUp, useSendSignUpCode, useVerifySignUpCode } from '../hooks/useSignUp';
import { authErrorMessage } from '../model/authErrors';
import { useCountdown } from '../model/useCountdown';

/**
 * 인증코드 만료 시간.
 *
 * **PRD 는 5분이지만 서버가 실제로 주는 건 10분이다** — 발송된 메일에
 * "유효 시간: 10분"으로 적혀 나온다(Supabase 의 Email OTP expiration).
 * 5분으로 두면 **코드가 아직 살아 있는데 화면이 먼저 잠긴다.**
 * 짧은 쪽에 맞추면 사용자만 손해라 서버를 따랐다.
 */
const CODE_TTL_SECONDS = 10 * 60;
/** PRD: 재발송 대기 1분. Supabase 의 기본 재요청 제한과도 같다. */
const RESEND_COOLDOWN_SECONDS = 60;
/**
 * **서버가 보내는 코드 길이다. 시안(6칸)과 다르다.**
 * Supabase 콘솔의 Email OTP Length 가 8 로 맞춰져 있어서, 6 으로 두면
 * 아이가 코드를 다 넣을 수 없다. 콘솔 값이 바뀌면 여기도 같이 바꾼다.
 */
const CODE_LENGTH = 8;

type Step = 1 | 2 | 3 | 4;

/**
 * 회원가입 (Figma 86:579).
 *
 * 이메일 → 인증코드 → 비밀번호 → 완료 4단계가 카드 하나 안에서 교체된다.
 * 각 단계가 Supabase 호출 하나에 대응한다 — 매핑과 그렇게 고른 이유는
 * `hooks/useSignUp.ts` 주석에 적어뒀다.
 *
 * 3단계가 끝나는 순간 이미 로그인된 상태가 된다(2단계에서 세션이 생긴다).
 * 그래서 완료 화면의 "아이 등록하기"는 다시 로그인시키지 않고 바로 넘어간다.
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

  const sendCode = useSendSignUpCode();
  const verifyCode = useVerifySignUpCode();
  const complete = useCompleteSignUp();

  const sendError = sendCode.isError
    ? authErrorMessage(sendCode.error, '인증코드를 보내지 못했습니다. 잠시 후 다시 시도해주세요.')
    : undefined;
  const verifyError = verifyCode.isError
    ? authErrorMessage(verifyCode.error, '인증코드를 확인하지 못했습니다. 다시 시도해주세요.')
    : undefined;
  const completeError = complete.isError
    ? authErrorMessage(complete.error, '비밀번호를 설정하지 못했습니다. 다시 시도해주세요.')
    : undefined;

  const handleSendCode = (): void => {
    if (sendCode.isPending) return;

    sendCode.mutate(email, {
      // 타이머는 메일이 실제로 나간 뒤에 시작한다. 먼저 돌리면 발송이 실패해도
      // 60초 동안 재발송이 막힌다.
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

  const handleComplete = (): void => {
    if (complete.isPending) return;

    complete.mutate(password, {
      onSuccess: () => {
        // 여기서 타이머를 세워둔 채로 두면 완료 화면 뒤에서 계속 돈다.
        expiry.stop();
        resend.stop();
        setStep(4);
      },
    });
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
          <Text variant="heading">비밀번호를 설정해주세요</Text>
          <PasswordFields
            password={password}
            onPasswordChange={(next) => {
              setPassword(next);
              if (complete.isError) complete.reset();
            }}
            confirm={confirm}
            onConfirmChange={setConfirm}
          />
          {completeError !== undefined && (
            <Text variant="footnote" color="danger">
              {completeError}
            </Text>
          )}
          <Button
            label="가입 완료"
            fullWidth
            size="lg"
            disabled={!isValidPassword(password) || password !== confirm}
            loading={complete.isPending}
            onPress={handleComplete}
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
