import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { colors, motion, radius } from '@/shared/theme';

import { Appear } from './Appear';
import { CheckIcon } from './icons';
import { Text } from './Text';

export interface StepIndicatorProps {
  /** 전체 단계 수 */
  total: number;
  /** 현재 단계 (1부터 시작) */
  current: number;
  style?: ViewStyle;
}

/**
 * 비밀번호 찾기 / 회원가입처럼 여러 단계로 나뉜 흐름의 진행 표시.
 *
 * 지난 단계는 주황 원 + 체크, 현재 단계는 흰 원 + 주황 테두리 + 숫자,
 * 이후 단계는 회색 원 + 숫자. 연결선은 지난 구간만 주황으로 찬다.
 *
 * 단계가 넘어갈 때 체크가 통 튀어 들어오고 연결선이 왼쪽에서 채워진다.
 * "하나 해냈다"가 눈에 보이는 게 어린 사용자에게는 다음 단계로 가는 동기가 된다.
 */
export function StepIndicator({ total, current, style }: StepIndicatorProps): React.JSX.Element {
  return (
    <View style={[styles.row, style]} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, index) => {
        const step = index + 1;
        return (
          <View key={step} style={styles.row}>
            {index > 0 && <Connector filled={step <= current} />}
            <StepCircle step={step} isDone={step < current} isCurrent={step === current} />
          </View>
        );
      })}
    </View>
  );
}

/** 0 → 1 로 흐르는 진행값. 색·너비 보간이라 네이티브 드라이버는 쓸 수 없다. */
function useProgress(active: boolean, duration: number): Animated.Value {
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(active ? 1 : 0));

  useEffect(() => {
    const target = active ? 1 : 0;
    if (reduceMotion) {
      progress.setValue(target);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: target,
      duration,
      easing: motion.easing.out,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [active, duration, progress, reduceMotion]);

  return progress;
}

function Connector({ filled }: { filled: boolean }): React.JSX.Element {
  const progress = useProgress(filled, motion.duration.slow);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.connector}>
      <Animated.View style={[styles.connectorFill, { width }]} />
    </View>
  );
}

interface StepCircleProps {
  step: number;
  isDone: boolean;
  isCurrent: boolean;
}

function StepCircle({ step, isDone, isCurrent }: StepCircleProps): React.JSX.Element {
  const progress = useProgress(isDone, motion.duration.base);
  const active = isDone || isCurrent;

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.circle,
        { borderColor: active ? colors.primary : colors.border, backgroundColor },
      ]}
    >
      {isDone ? (
        <Appear from="scale">
          <CheckIcon width={14} height={14} />
        </Appear>
      ) : (
        <Text variant="caption" color={isCurrent ? 'primary' : 'textSubtle'}>
          {step}
        </Text>
      )}
    </Animated.View>
  );
}

const CIRCLE_SIZE = 32;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 2,
  },
  connector: {
    width: 48, // 디자인 실측
    height: 2,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  connectorFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
