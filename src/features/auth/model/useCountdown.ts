import { useCallback, useEffect, useState } from 'react';

export interface Countdown {
  /** 남은 초 */
  remaining: number;
  /** `04:32` 형식 */
  label: string;
  isRunning: boolean;
  restart: () => void;
}

function format(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 1초마다 줄어드는 카운트다운.
 *
 * 인증코드 만료(5분)와 재발송 대기(1분)에 쓴다. PRD 기준이며 두 값 모두
 * 호출부에서 정한다.
 */
export function useCountdown(seconds: number): Countdown {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;

    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [remaining]);

  const restart = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, label: format(remaining), isRunning: remaining > 0, restart };
}
