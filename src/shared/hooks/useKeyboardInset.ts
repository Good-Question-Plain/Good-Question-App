import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * 소프트 키보드가 화면 아래를 덮는 높이(dp). 닫혀 있으면 0.
 *
 * 이게 왜 필요한가: AndroidManifest 에 `adjustResize` 가 걸려 있어도, edge-to-edge
 * 가 켜져 있으면(Expo SDK 54+ 기본값) 창이 줄어들지 않는다. 키보드는 창을 밀지
 * 않고 그 위에 겹치는 inset 으로만 들어온다. 그래서 화면 하단 컨텐츠 — 특히 폼의
 * 제출 버튼 — 이 키보드에 가려 손이 닿지 않게 된다.
 *
 * 태블릿에서는 키보드가 화면 절반가량을 차지해서 문제가 훨씬 크다.
 * 실제로 로그인 화면의 "계속하기" 버튼이 완전히 가려지는 걸 기기에서 확인했다.
 */
export function useKeyboardInset(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // iOS 는 Will* 이 애니메이션과 같이 시작해 더 부드럽고, 안드로이드는 Did* 만 있다.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (event) => {
      setHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
