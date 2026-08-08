# Good Question App — 작업 규칙

안드로이드 태블릿용 Expo(SDK 57) + expo-router 앱. 해커톤 프로젝트라 **속도와 가독성**이 둘 다 중요하다.

## Expo 문서

Expo 는 버전마다 API 가 바뀐다. Expo/RN API 를 쓰기 전에
https://docs.expo.dev/versions/v57.0.0/ 의 해당 버전 문서를 확인한다.

## 아키텍처

feature-based. 자세한 규칙은 `src/features/README.md`.

- `src/app/` — expo-router 라우트. **얇게.** 화면 구현은 feature 의 `screens/` 에 두고 라우트는 re-export 만 한다.
- `src/features/<name>/` — 도메인 코드. 외부 공개는 `index.ts` barrel 로만.
- `src/shared/` — 도메인 지식이 없는 것들만. UI 프리미티브, 테마 토큰, API 클라이언트, 공용 훅.

**금지**

- feature 내부 경로를 밖에서 직접 import (`@/features/quiz/model/store` ✗)
- feature 끼리 직접 import — 공유가 필요하면 `shared` 로 올린다
- `src/shared` 에 특정 도메인 타입/로직 추가

## 디자인 소스

Figma 파일 `fQDu6PUvUk1miUa08yEInS` (굿퀘스천), 퍼블리싱 대상 섹션은 `182:303`.
기준 프레임은 **1024×768 가로**(`DESIGN_WIDTH` / `DESIGN_HEIGHT`).

화면을 구현할 때는 스크린샷만 보고 짐작하지 말고 `get_design_context` 로 실제 노드를
읽는다. 단, 반환된 React+Tailwind 코드는 **참고용**이고 그대로 옮기지 않는다.

## 스타일링

- `StyleSheet.create` + `@/shared/theme` 토큰.
- **색상과 타이포는 예외 없이 토큰만 쓴다.** 하드코딩된 hex, fontSize, fontWeight 금지.
- **간격은 토큰 우선.** 다만 디자인이 스케일을 벗어나는 실측값(15, 17, 30, 50 등)을
  쓰는 경우가 있는데, 그럴 때는 화면 파일에서 숫자를 그대로 쓰되 근거를 주석으로 남긴다.
  억지로 반올림해서 디자인을 틀어뜨리지 않는다.
- 텍스트는 `@/shared/ui` 의 `Text` 를 쓴다 (react-native 의 `Text` 직접 사용 금지).
- 화면 껍데기는 `Screen` 을 쓴다 (SafeAreaView 를 화면마다 새로 쓰지 않는다).
- 새 색이 필요하면 `theme/colors.ts` 의 `palette` 에 원시값을 넣고 `colors` 에 의미 별칭을 만든다.
  Figma Variable 로 등록돼 있지 않은 값이면 주석으로 표시해둔다.

### 폰트

Pretendard 를 굵기별로 4개(Regular/SemiBold/Bold/Black) 번들해 쓴다.
**`fontWeight` 로 굵기를 조절하지 않는다** — 안드로이드에서 가짜 볼드가 합성돼 자간이
뭉개진다. 항상 `typography` 토큰(= 굵기별 `fontFamily`)을 통해 지정한다.

### 모션

저연령 사용자가 쓰는 앱이라 "눌렀다/바뀌었다"가 눈에 보여야 한다. 다만 느리면
답답하니 값은 `theme/motion.ts` 토큰을 쓰고 duration 을 화면에서 직접 정하지 않는다.

- 누를 수 있는 것은 `PressableScale` 로 감싸 눌림 피드백을 준다.
- 등장 애니메이션은 `Appear` 를 쓴다. **opacity 0 에서 시작하는 애니메이션을
  직접 만들지 않는다** — 애니메이션이 멈추면 화면이 빈 채로 남는다.
  `Appear` 는 타이머 안전장치로 최종 상태를 보장한다.
- 구현은 RN 내장 `Animated`. Reanimated 는 설치돼 있지만 직접 쓰지 않는다.
- 기기의 '동작 줄이기' 설정을 존중한다 (`useReducedMotion`).

### 키보드

**입력이 있는 화면은 `Screen` 에 `scrollable` 을 켠다.**

이 프로젝트는 edge-to-edge 가 켜져 있어(Expo SDK 54+ 기본값) AndroidManifest 의
`adjustResize` 가 동작하지 않는다. 키보드는 창을 밀지 않고 위에 겹치기만 한다.
태블릿 키보드는 화면 절반가량을 차지해서, 스크롤이 없으면 하단 버튼에 손이 닿지 않는다.
(실제로 로그인 화면의 "계속하기" 버튼이 완전히 가려지는 걸 기기에서 확인했다.)

`Screen` 이 `useKeyboardInset` 으로 키보드 높이만큼 아래 여백을 잡아주지만,
**화면 쪽 스타일에서 `flex: 1` 을 쓰면 높이가 뷰포트에 고정돼 스크롤이 생기지 않는다.**
스크롤 화면의 최상위 컨테이너에는 `flexGrow: 1` 을 쓴다.

### 아이콘 · 이미지

Figma 에서 내보낸 에셋만 쓴다. SVG path 를 직접 손으로 그리거나 비슷한 아이콘 라이브러리로
대체하지 않는다. 그림자·블러 같은 효과도 생략하지 않고 그대로 구현한다.

## 태블릿

- 기기 종류가 아니라 **폭**으로 분기한다: `useResponsive().select({ compact, medium, expanded })`.
  분할 화면에서도 폭이 줄기 때문에 `Platform` 이나 화면 인치로 판단하면 틀린다.
- 터치 타겟 최소 48dp (`hitSize.min`).
- 기본 방향은 가로(`app.json` 의 `orientation: "landscape"`).

## 데이터

- 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand. 서버에서 온 데이터를 zustand 에 복사하지 않는다.
- HTTP 는 `@/shared/api` 의 `request()` / `apiClient` 만 쓴다. feature 에서 `axios` 직접 import 금지.
- 에러는 인터셉터가 `ApiError` 로 정규화한다. 화면에서는 `error.kind` 로 분기한다.
- queryKey 는 각 feature 의 `api/` 안에 팩토리(`quizKeys`)로 모은다.

## TypeScript

- `strict`. `any` 대신 `unknown` + 좁히기.
- 컴포넌트 반환 타입은 `React.JSX.Element` 로 명시한다.
- props 인터페이스는 `export` 한다 (조합할 때 필요하다).

## 확인

변경 후 최소한 아래는 통과시킨다.

```bash
npm run typecheck
npm run lint
```
