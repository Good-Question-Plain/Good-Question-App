import { useCallback, useState } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { motion } from '@/shared/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** 눌렀을 때 줄어들 비율. 큰 카드는 덜 줄이는 게 자연스럽다. */
  scaleTo?: number;
}

/**
 * 누르면 살짝 줄었다가 튕겨 돌아오는 Pressable.
 *
 * 저연령 사용자는 "눌렀는데 아무 반응이 없다"를 실패로 인식하고 계속 연타한다.
 * 눌리는 순간(onPressIn) 바로 반응하는 게 중요해서 onPress 가 아니라
 * PressIn/Out 에 물려 있다.
 *
 * 여기는 `Appear` 와 달리 안전장치가 없어도 된다. 애니메이션이 돌지 않으면
 * 눌림 효과만 사라질 뿐, 버튼은 그대로 보이고 동작한다.
 */
export function PressableScale({
  style,
  scaleTo = motion.pressScale,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps): React.JSX.Element {
  const [scale] = useState(() => new Animated.Value(1));
  const reduceMotion = useReducedMotion();

  const spring = useCallback(
    (toValue: number) => {
      Animated.spring(scale, {
        toValue,
        damping: motion.spring.damping,
        stiffness: motion.spring.stiffness,
        mass: motion.spring.mass,
        useNativeDriver: true,
      }).start();
    },
    [scale],
  );

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (event) => {
      if (!reduceMotion) spring(scaleTo);
      onPressIn?.(event);
    },
    [onPressIn, reduceMotion, scaleTo, spring],
  );

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (event) => {
      if (!reduceMotion) spring(1);
      onPressOut?.(event);
    },
    [onPressOut, reduceMotion, spring],
  );

  return (
    <AnimatedPressable
      style={[style, { transform: [{ scale }] }]}
      disabled={disabled}
      onPressIn={disabled === true ? undefined : handlePressIn}
      onPressOut={disabled === true ? undefined : handlePressOut}
      {...rest}
    />
  );
}
