import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/shared/theme';

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
 */
export function StepIndicator({ total, current, style }: StepIndicatorProps): React.JSX.Element {
  return (
    <View style={[styles.row, style]} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, index) => {
        const step = index + 1;
        const isDone = step < current;
        const isCurrent = step === current;

        return (
          <View key={step} style={styles.row}>
            {index > 0 && (
              <View
                style={[styles.connector, isDone || isCurrent ? styles.connectorFilled : null]}
              />
            )}
            <View
              style={[
                styles.circle,
                isDone && styles.circleDone,
                isCurrent && styles.circleCurrent,
              ]}
            >
              {isDone ? (
                <CheckIcon width={14} height={14} />
              ) : (
                <Text variant="caption" color={isCurrent ? 'primary' : 'textSubtle'}>
                  {step}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  circleDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  circleCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  connector: {
    width: 48, // 디자인 실측
    height: 2,
    backgroundColor: colors.border,
  },
  connectorFilled: {
    backgroundColor: colors.primary,
  },
});
