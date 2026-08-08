import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * 기기 설정의 '동작 줄이기'가 켜져 있는지.
 *
 * 켜져 있으면 애니메이션을 건너뛰고 최종 상태로 바로 보여준다.
 * 전정기관이 예민한 사용자에게 움직임은 실제로 불편을 준다.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (!cancelled) setReduced(value);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return reduced;
}
