import { type ReactNode, useEffect, useState } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { motion } from '@/shared/theme';

export interface AppearProps {
  children: ReactNode;
  /** 등장 지연(ms). 여러 개를 순차로 띄울 때 쓴다. */
  delay?: number;
  /** 'up' = 아래에서 올라오며 페이드, 'scale' = 살짝 커지며 페이드 */
  from?: 'up' | 'scale';
  style?: StyleProp<ViewStyle>;
}

/** 스프링은 duration 이 정해져 있지 않아 여유를 넉넉히 준다. */
const FALLBACK_SLACK = 400;

/**
 * 마운트될 때 한 번 등장하는 래퍼.
 *
 * **제1원칙은 "무슨 일이 있어도 콘텐츠는 보인다" 이다.**
 * 등장 애니메이션은 opacity 0 에서 시작하므로, 애니메이션이 돌지 않으면 화면이
 * 빈 채로 남는다. 애니메이션 구동은 requestAnimationFrame 에 의존하는데 앱이
 * 백그라운드로 내려가거나 프레임이 스로틀되면 rAF 가 아예 멈춘다
 * (백그라운드 탭에서 실제로 이 상태를 재현했다 — rAF 가 1초에 0프레임이었다).
 *
 * 그래서 두 겹으로 막는다.
 * 1. 애니메이션이 정상 종료되면 최종값에 도달한다.
 * 2. 예상 소요시간이 지나도 끝나지 않았으면 타이머로 최종값을 강제한다.
 *    setTimeout 은 rAF 와 달리 백그라운드에서도(느리게나마) 발화한다.
 *
 * Reanimated 의 `entering` 레이아웃 애니메이션을 쓰지 않는 것도 같은 이유다.
 * 그쪽은 시작 상태로 `visibility: hidden` 을 깔아서, 실패하면 아예 사라진다.
 */
export function Appear({
  children,
  delay = 0,
  from = 'up',
  style,
}: AppearProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }

    const duration = motion.duration.slow;
    const animation =
      from === 'scale'
        ? Animated.spring(progress, {
            toValue: 1,
            delay,
            damping: motion.spring.damping,
            stiffness: motion.spring.stiffness,
            mass: motion.spring.mass,
            useNativeDriver: true,
          })
        : Animated.timing(progress, {
            toValue: 1,
            delay,
            duration,
            easing: motion.easing.out,
            useNativeDriver: true,
          });

    animation.start();

    const fallback = setTimeout(
      () => {
        animation.stop();
        progress.setValue(1);
      },
      delay + duration + FALLBACK_SLACK,
    );

    return () => {
      clearTimeout(fallback);
      animation.stop();
    };
  }, [delay, from, progress, reduceMotion]);

  const transform =
    from === 'scale'
      ? [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }]
      : [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }];

  return (
    <Animated.View style={[style, { opacity: progress, transform }]}>{children}</Animated.View>
  );
}
