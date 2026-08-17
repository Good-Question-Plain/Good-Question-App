import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface NarrationSpeechResult {
  /** 지금 읽어주는 중인지. 마이크를 잠가둘지 판단하는 데 쓴다. */
  isSpeaking: boolean;
  /**
   * 주어진 글을 읽는다. 읽던 게 있으면 멈추고 새로 시작한다.
   *
   * `onFinish` 는 **읽기가 끝났거나 실패했을 때** 불린다. 화면이 그 시점에
   * 다음 단계로 넘어가면 되고, 실패해도 멈추지 않는다.
   */
  speak: (text: string, onFinish?: () => void) => void;
  stop: () => void;
}

/**
 * 장면 나레이션을 소리 내어 읽어준다.
 *
 * **TTS 는 앱이 맡는다** — 서버는 글만 내려준다.
 *
 * 아이가 아직 글을 빠르게 읽지 못하는 게 이 앱의 전제라(PRD), 나레이션을
 * 읽어주는 건 부가 기능이 아니라 기본 동작이다. 그래서 장면이 바뀌면
 * 자동으로 읽고, "다시 듣기" 로 다시 읽을 수 있다.
 *
 * @param options.language 기본 `ko-KR`. 기기에 한국어 음성이 없으면 시스템이
 *   가장 가까운 것으로 대체하고, 그래도 없으면 조용히 넘어간다 —
 *   **읽어주기가 실패해도 화면은 그대로 진행돼야 한다.**
 * @param options.rate 아이가 따라올 수 있게 기본보다 조금 느리게 읽는다.
 */
export function useNarrationSpeech(): NarrationSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // 화면을 벗어난 뒤 콜백이 늦게 도착해도 상태를 건드리지 않게 한다.
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    return () => {
      activeRef.current = false;
      // 화면을 떠나면 즉시 멈춘다. 안 멈추면 다음 화면에서 계속 들린다.
      Speech.stop();
    };
  }, []);

  const speak = useCallback((text: string, onFinish?: () => void) => {
    // 읽을 게 없으면 기다릴 것도 없다 — 바로 다음 단계로 보낸다.
    if (text.trim().length === 0) {
      onFinish?.();
      return;
    }

    // 겹쳐 읽으면 두 목소리가 동시에 난다. 항상 멈추고 새로 시작한다.
    Speech.stop();
    setIsSpeaking(true);

    const finish = (): void => {
      if (!activeRef.current) return;
      setIsSpeaking(false);
      onFinish?.();
    };

    Speech.speak(text, {
      language: 'ko-KR',
      // 1.0 이 기본. 아이가 듣고 따라오기엔 조금 빠르다.
      rate: 0.95,
      onDone: finish,
      // 음성이 없거나 엔진이 실패해도 화면은 계속 굴러가야 한다.
      onError: finish,
      // `stop()` 으로 끊은 경우는 다음 단계로 넘기지 않는다 — 아이가
      // 마이크를 눌러 끊은 것이라 이미 다른 흐름으로 들어가 있다.
      onStopped: () => {
        if (activeRef.current) setIsSpeaking(false);
      },
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}
