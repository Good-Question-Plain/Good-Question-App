import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from 'expo-speech-recognition';
import { useCallback, useRef, useState } from 'react';

/**
 * 아이 말 받아쓰기 (음성 → 글). **안드로이드 내장 음성인식을 앱에서 직접 쓴다.**
 *
 * 두 곳에서 쓴다.
 *
 * - **다시 말하기**(`StoryRetellScreen`) — `retell` 이 완성된 **텍스트**를 받는데
 *   서버에 음성을 글로 바꿔주는 엔드포인트가 없다
 * - **대화 화면**(`StoryPlayScreen`) — 임시. 서버가 아직 대화 씬을 주지 않아
 *   `speak` 가 400 이라, 그동안 아이 말을 화면에만이라도 보여준다
 *
 * 둘 다 서버가 받아주게 되면 이 훅을 버리고 `useChildRecorder`(음성 파일 업로드)로
 * 갈아끼우면 된다.
 *
 * ## 왜 이렇게 복잡한가 — 이어 말하기를 직접 만들어야 한다
 *
 * 라이브러리의 `continuous` 옵션(쉬어도 계속 듣기)은 **안드로이드 13 이상에서만
 * 된다.** 대상 태블릿(SM-T510)은 안드로이드 9라 쓸 수 없고, 그 경우 인식기는
 * **문장 하나를 확정하면 스스로 멈춘다.** 아이가 이야기를 다시 말할 때는 중간에
 * 몇 번씩 쉬기 때문에 그대로 두면 첫 문장만 받아쓰고 끝난다.
 *
 * 그래서 **끝나면 다시 켜는 것을 앱이 직접 한다** — 아이가 마이크를 끌 때까지
 * `end`/무음 오류마다 재시작하고, 확정된 문장을 이어 붙인다.
 *
 * 재시작이 곧바로 실패하는 상황(인식기 자체가 죽은 기기)에서 무한 루프가 되지
 * 않도록 연속 실패를 세어 멈춘다.
 */

/** 이어 말하기 재시작이 곧바로 실패할 때, 몇 번까지 참을지. */
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * 끊긴 인식기를 다시 켜기까지의 간격.
 *
 * 0 이면 안드로이드가 이전 세션을 정리하기 전에 다시 열려서 마이크가
 * 열렸다 닫히기를 반복한다. 너무 길면 그 사이 말이 통째로 빠진다.
 */
const RESTART_DELAY_MS = 300;

/** 쉬는 것으로 봐야 하는 오류들. 아이가 잠깐 말을 멈춘 것뿐이라 다시 켠다. */
const PAUSE_ERRORS: ReadonlySet<string> = new Set<ExpoSpeechRecognitionErrorCode>([
  'no-speech',
  'speech-timeout',
]);

/** 다시 켜도 소용없는 오류들. 기기·권한 문제라 안내로 넘긴다. */
const FATAL_ERRORS: ReadonlySet<string> = new Set<ExpoSpeechRecognitionErrorCode>([
  'not-allowed',
  'service-not-allowed',
  'language-not-supported',
  'audio-capture',
]);

export interface DictationResult {
  /** 듣는 중인지. 마이크 버튼과 물결 표시가 이 값으로 갈린다. */
  isListening: boolean;
  /** 지금까지 받아쓴 글. 확정된 문장 + 말하는 중인 문장이 이어져 있다. */
  text: string;
  /**
   * 받아쓰기를 쓸 수 없다 (권한 거부 · 인식기 없음 · 한국어 미지원 · 네트워크).
   * 화면에서 안내하고 완료 버튼을 막지 않아야 한다 — 받아쓰기가 안 된다고
   * 활동을 못 끝내면 아이가 갇힌다.
   */
  failure: 'denied' | 'unavailable' | 'network' | null;
  start: () => Promise<void>;
  stop: () => void;
  /** 받아쓴 글을 지운다. 장면이 바뀔 때 앞 장면의 말이 남지 않게 한다. */
  reset: () => void;
}

export function useDictation(): DictationResult {
  const [isListening, setIsListening] = useState(false);
  /** 확정된 문장들. 화면이 다시 그려져도 유지돼야 해서 state 로 둔다. */
  const [finals, setFinals] = useState<string[]>([]);
  /** 지금 말하는 중인 문장. 확정되면 `finals` 로 옮겨간다. */
  const [interim, setInterim] = useState('');
  const [failure, setFailure] = useState<DictationResult['failure']>(null);

  /** 아이가 마이크를 켜 둔 상태인지. 끊긴 인식을 다시 켤지 판단하는 기준이다. */
  const wantsListening = useRef(false);
  /** 이번에 켜서 한 글자도 못 받은 채 끝난 횟수. 무한 재시작 방지용이다. */
  const failureStreak = useRef(0);
  /** 인식기를 켜는 중인지. 재시작이 겹쳐 마이크가 계속 닫히는 걸 막는다. */
  const starting = useRef(false);
  /**
   * `interim` 의 사본.
   *
   * 장면이 끝날 때 아직 확정되지 않은 문장을 건져내야 하는데, 이벤트 핸들러에서
   * state 를 바로 읽을 수 없어 ref 로 같이 들고 있는다.
   */
  const interimRef = useRef('');

  /**
   * 확정되지 않은 채 남은 문장을 `finals` 로 옮긴다.
   *
   * **이게 없으면 말이 통째로 사라진다.** 안드로이드가 마지막 결과를 빈 배열로
   * 주는 경우가 있는데(기기 로그의 `onResults(), results: []`), 그러면 받아쓴
   * 문장이 `interim` 에만 남는다. 다음 구간의 첫 중간 결과가 그 자리를 덮어써서
   * 앞 문장이 없어진다.
   */
  const flushInterim = useCallback(() => {
    const pending = interimRef.current;
    if (pending.length === 0) return;

    interimRef.current = '';
    setInterim('');
    setFinals((previous) => [...previous, pending]);
  }, []);

  const beginSegment = useCallback(() => {
    // 이미 켜는 중이면 또 켜지 않는다. 겹쳐 부르면 안드로이드가 앞 세션을 끊고
    // 새로 여는데, 그 과정에서 다시 `end` 가 날아와 재시작이 배로 늘어난다
    // (기기 로그에서 1초 안에 세 번 켜지는 걸 확인했다).
    if (starting.current) return;
    starting.current = true;

    ExpoSpeechRecognitionModule.start({
      lang: 'ko-KR',
      // 말하는 대로 글자가 뜨게 한다 — 아이가 자기 말이 들어가고 있는 걸 봐야 한다.
      interimResults: true,
      // 안드로이드 12 이하에서는 지원되지 않는다. 켜 봐야 무시되므로
      // `end` 재시작 쪽에 의존한다 (위 주석 참고).
      continuous: false,
      // 네트워크 인식을 쓴다. 안드로이드 12 이하에는 기기 내장 인식이 없다.
      requiresOnDeviceRecognition: false,
      /**
       * 기본값이 너무 짧다.
       *
       * 안드로이드 인식기는 0.5~1초쯤 조용하면 문장이 끝났다고 보고 꺼진다.
       * 아이가 이야기를 되짚느라 뜸을 들이면 그때마다 끊겨서 말이 토막나고,
       * 재시작 사이에 마이크가 닫혀 그 구간의 소리를 통째로 놓친다.
       * 실제로 기기에서 긴 문장이 "아아" 두 글자로만 잡혔다.
       */
      androidIntentOptions: {
        EXTRA_LANGUAGE_MODEL: 'free_form',
        // 말이 끝났다고 판단하기까지 기다리는 침묵 (기본 ~1초).
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
        // 이 시간 전에는 침묵으로 끊지 않는다.
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 10000,
      },
    });
  }, []);

  useSpeechRecognitionEvent('start', () => {
    starting.current = false;
    setIsListening(true);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (transcript.length === 0) return;

    // 뭔가 받아썼으면 재시작이 정상 동작하고 있다는 뜻이다.
    failureStreak.current = 0;

    if (event.isFinal) {
      interimRef.current = '';
      setFinals((previous) => [...previous, transcript]);
      setInterim('');
      return;
    }
    interimRef.current = transcript;
    setInterim(transcript);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (PAUSE_ERRORS.has(event.error)) {
      // 아이가 잠깐 쉰 것뿐이다. `end` 가 이어서 오고 거기서 다시 켠다.
      return;
    }

    if (FATAL_ERRORS.has(event.error)) {
      wantsListening.current = false;
      setFailure(event.error === 'not-allowed' ? 'denied' : 'unavailable');
      return;
    }

    if (event.error === 'network') {
      wantsListening.current = false;
      setFailure('network');
      return;
    }

    // `busy` · `client` · `unknown` 은 다시 켜면 풀리는 경우가 있다.
    // 다만 연달아 나면 기기 문제로 보고 멈춘다.
    failureStreak.current += 1;
  });

  useSpeechRecognitionEvent('end', () => {
    starting.current = false;
    // 구간이 끝났다. 확정 못 받은 문장을 여기서 건져둔다 (위 `flushInterim` 참고).
    flushInterim();

    if (!wantsListening.current) {
      setIsListening(false);
      return;
    }

    if (failureStreak.current >= MAX_CONSECUTIVE_FAILURES) {
      wantsListening.current = false;
      setIsListening(false);
      setFailure('unavailable');
      return;
    }

    // 아이는 아직 말하는 중이다. 인식기가 문장 하나로 끊은 것뿐이라 다시 켠다.
    // **곧바로 켜면 안 된다** — 안드로이드가 이전 세션을 정리하기 전에 부르면
    // `busy` 로 튕기거나 마이크가 열렸다 닫히기를 반복한다. 한 박자 쉰다.
    setTimeout(beginSegment, RESTART_DELAY_MS);
  });

  const start = useCallback(async () => {
    // 이미 듣는 중이면 아무것도 하지 않는다. 다시 부르면 그때까지 받아쓴 글이
    // 지워진다 — 아이가 마이크를 두 번 누르면 말한 게 사라진다는 뜻이다.
    if (wantsListening.current) return;

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setFailure('denied');
      return;
    }

    setFailure(null);
    setFinals([]);
    setInterim('');
    interimRef.current = '';
    failureStreak.current = 0;
    starting.current = false;
    wantsListening.current = true;
    beginSegment();
  }, [beginSegment]);

  const reset = useCallback(() => {
    setFinals([]);
    setInterim('');
    interimRef.current = '';
    setFailure(null);
  }, []);

  const stop = useCallback(() => {
    wantsListening.current = false;
    // `stop` 은 마지막 문장을 확정한 뒤 `end` 를 보낸다 (`abort` 는 버린다).
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const text = [...finals, interim].filter((part) => part.length > 0).join(' ');

  return { isListening, text, failure, start, stop, reset };
}
