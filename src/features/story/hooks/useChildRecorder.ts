import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

/** 서버에 올릴 파일. `speak` 가 m4a 를 요구한다. */
export interface RecordedAudio {
  uri: string;
  name: string;
  type: string;
}

export interface ChildRecorderResult {
  /** 녹음 중인지. 마이크 상태를 이 값으로 굴린다. */
  isRecording: boolean;
  /** 마이크 권한이 거부됨. 화면에서 안내해야 한다. */
  isDenied: boolean;
  start: () => Promise<void>;
  /** 녹음을 멈추고 파일을 돌려준다. 실패하면 null. */
  stop: () => Promise<RecordedAudio | null>;
}

/**
 * 아이 목소리 녹음.
 *
 * `POST /progress/{story_id}/steps/{step_index}/speak` 가 **m4a 파일**을 받는다.
 * `RecordingPresets.HIGH_QUALITY` 가 마침 `.m4a`(mpeg4/aac)라 그대로 쓴다.
 *
 * **권한은 화면이 열릴 때 미리 물어본다.** 아이가 마이크를 처음 누른 순간에
 * 권한 팝업이 뜨면, 아이는 그게 뭔지 모르고 닫아버린다. 대화가 시작되기 전에
 * 한 번 받아두는 편이 낫다.
 *
 * `allowsRecording` 을 켜지 않으면 안드로이드에서 녹음이 시작되지 않는다.
 */
export function useChildRecorder(): ChildRecorderResult {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const granted = await AudioModule.requestRecordingPermissionsAsync();
      if (!active) return;

      setIsDenied(!granted.granted);
      if (!granted.granted) return;

      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();

    return () => {
      active = false;
    };
  }, []);

  const start = useCallback(async () => {
    if (isDenied) return;
    await recorder.prepareToRecordAsync();
    recorder.record();
  }, [recorder, isDenied]);

  const stop = useCallback(async (): Promise<RecordedAudio | null> => {
    await recorder.stop();
    // 멈춘 뒤에야 uri 가 채워진다. 준비 전에 멈추면 null 일 수 있다.
    if (recorder.uri === null || recorder.uri === undefined) return null;

    return { uri: recorder.uri, name: 'speech.m4a', type: 'audio/m4a' };
  }, [recorder]);

  return { isRecording: state.isRecording, isDenied, start, stop };
}
