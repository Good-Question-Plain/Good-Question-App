import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

export interface PickedImage {
  uri: string;
  contentType: string;
}

export interface PickProfileImageResult {
  /** 고른 사진. 아직 서버에 올리지 않은 로컬 파일이다. */
  picked: PickedImage | null;
  /** 시스템 사진 선택기를 연다. 취소하면 아무것도 바뀌지 않는다. */
  pick: () => Promise<void>;
  clear: () => void;
  isPicking: boolean;
}

/**
 * 아이 프로필 사진 고르기.
 *
 * 디자인(92:808)의 "사진 올리기" 칸이 이걸 부른다.
 *
 * **권한을 따로 요청하지 않는다.** SDK 57 의 `launchImageLibraryAsync` 는
 * 안드로이드에서 시스템 선택기를 띄우는 것뿐이라 사진첩 권한이 필요 없다
 * (문서: "No permissions request is necessary for launching the image library").
 * 권한 팝업을 먼저 띄우면 아이가 무슨 창인지 모르고 거절하기 쉽다.
 *
 * 정사각형으로 자르게 한다 — 아바타 자리가 원형이라 원본 비율 그대로 넣으면
 * 얼굴이 잘린다.
 */
export function usePickProfileImage(): PickProfileImageResult {
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pick = useCallback(async () => {
    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // SDK 51+ 부터 배열이다. `MediaTypeOptions` 는 deprecated.
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        // 프로필 사진이라 원본 화질이 필요 없다. 태블릿 사진은 그대로 올리면
        // 몇 MB 씩 되어 업로드가 눈에 띄게 느려진다.
        quality: 0.7,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (asset === undefined) return;

      setPicked({
        uri: asset.uri,
        // mimeType 은 선택 경로에 따라 비어 올 수 있다. 서버가 이미지가 아니면
        // 400 을 주므로 비워 보내지 않고 기본값을 채운다.
        contentType: asset.mimeType ?? 'image/jpeg',
      });
    } finally {
      setIsPicking(false);
    }
  }, []);

  const clear = useCallback(() => setPicked(null), []);

  return { picked, pick, clear, isPicking };
}
