import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, type AppStateStatus } from 'react-native';

/** 기기에 한국어 음성이 있는지. 아직 확인 전이면 `null`. */
export type KoreanVoiceStatus = 'checking' | 'available' | 'missing';

export interface KoreanVoiceResult {
  status: KoreanVoiceStatus;
  /** 음성 데이터 설치 화면을 연다. 그런 화면이 없는 기기면 TTS 설정으로 떨어진다. */
  openInstaller: () => Promise<void>;
}

/**
 * 읽어주기에 쓸 **한국어 음성이 기기에 있는지** 보고, 없으면 설치 화면을 열어준다.
 *
 * **이게 없으면 앱이 조용히 반쪽이 된다.** 아이가 아직 글을 빠르게 못 읽는다는 게
 * 이 앱의 전제라(PRD) 나레이션 읽어주기는 부가 기능이 아니다. 그런데 음성이 없으면
 * `expo-speech` 는 **에러도 없이 그냥 아무 소리도 내지 않는다** — 화면은 멀쩡히
 * 굴러가서 아무도 이상한 걸 눈치채지 못한다.
 *
 * 실제로 시연 태블릿(SM-T510)이 그랬다 — 기본 엔진이 `com.samsung.SMT:en_US` 이고
 * 설치된 음성 6개 중 **한국어가 0개**였다.
 *
 * ## 왜 인텐트를 직접 쏘나
 *
 * 안드로이드는 음성 데이터 설치를 엔진이 맡는다. RN 코어의 `Linking.sendIntent` 로
 * 그 화면을 바로 열 수 있어서 **네이티브 모듈을 새로 넣을 필요가 없다**
 * (`expo-intent-launcher` 를 추가하면 APK 를 다시 빌드해야 한다).
 *
 * 다만 그 인텐트를 처리하는 액티비티가 **없는 기기가 있다.** 그래서 실패하면 시스템
 * TTS 설정으로 떨군다 — 거기서도 음성을 받을 수 있다.
 */
export function useKoreanVoice(): KoreanVoiceResult {
  const [status, setStatus] = useState<KoreanVoiceStatus>('checking');

  const check = useCallback(() => {
    void Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const hasKorean = voices.some((voice) => voice.language.toLowerCase().startsWith('ko'));
        setStatus(hasKorean ? 'available' : 'missing');
      })
      // 조회 자체가 실패하는 기기에서 설치를 권하면 헛걸음을 시킨다. 조용히 넘어간다.
      .catch(() => setStatus('available'));
  }, []);

  useEffect(() => {
    check();

    // 설치하고 돌아오면 안내가 사라져야 한다. 앱으로 돌아올 때마다 다시 본다.
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') check();
    });

    return () => subscription.remove();
  }, [check]);

  const openInstaller = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      await Linking.sendIntent(INSTALL_TTS_DATA);
    } catch {
      // 설치 화면이 없는 기기다. 설정에서 직접 받을 수 있게 TTS 설정을 연다.
      try {
        await Linking.sendIntent(TTS_SETTINGS);
      } catch {
        // 여기까지 막히면 기기에서 손으로 찾는 수밖에 없다. 앱이 할 수 있는 건 없다.
      }
    }
  }, []);

  return { status, openInstaller };
}

/** `TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA`. 엔진의 음성 데이터 설치 화면. */
const INSTALL_TTS_DATA = 'android.speech.tts.engine.INSTALL_TTS_DATA';

/** 시스템 TTS 설정. 설치 화면이 없는 기기용 대비책이다. */
const TTS_SETTINGS = 'com.android.settings.TTS_SETTINGS';
