# Good Question App

안드로이드 **태블릿** 기준 React Native (Expo) 앱.

## 스택

| 영역      | 선택                                          |
| --------- | --------------------------------------------- |
| 런타임    | Expo SDK 57 + dev client, RN 0.86             |
| 언어      | TypeScript (strict)                           |
| 라우팅    | expo-router (파일 기반, typed routes)         |
| 서버 상태 | TanStack Query + axios                        |
| 클라 상태 | Zustand                                       |
| 스타일    | StyleSheet + `src/shared/theme` 토큰          |
| 아키텍처  | feature-based (`src/features` + `src/shared`) |

## 시작하기

```bash
npm install
```

`.env.example` 를 복사해 `.env` 를 만들고 API 주소를 채운다.

```bash
cp .env.example .env
```

dev client 를 태블릿(또는 에뮬레이터)에 한 번 설치한다. 네이티브 의존성이
바뀌지 않는 한 이 명령은 다시 실행할 필요가 없다.

```bash
npm run android
```

이후 개발은 Metro 만 띄우면 된다.

```bash
npm run start
```

## 명령어

```bash
npm run start      # Metro 번들러 (dev client 모드)
npm run android    # 네이티브 빌드 + 기기 설치
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # tsc --noEmit
```

## 폴더 구조

```
src/
├── app/          # expo-router 라우트. 얇게 유지하고 화면은 feature 에서 가져온다.
├── features/     # 기능 단위. 규칙은 src/features/README.md 참고
└── shared/
    ├── api/      # axios 인스턴스, queryClient, 에러 정규화
    ├── config/   # 환경 변수
    ├── hooks/    # useResponsive 등 공용 훅
    ├── theme/    # 색상 · 간격 · 타이포그래피 토큰
    └── ui/       # Button, Card, Screen, Text 등 프리미티브
```

경로 별칭은 `@/` → `src/` 하나만 쓴다. 상대경로는 같은 feature 안에서만.

## 태블릿 관련 메모

- `app.json` 의 `orientation` 이 `landscape` 다. 세로도 허용하려면 `"default"` 로 바꾼다.
- 화면 크기 분기는 `useResponsive()` 의 `select({ compact, medium, expanded })` 를 쓴다.
  분할 화면(멀티윈도우)에서도 폭이 줄어들기 때문에 기기 종류가 아니라 **폭**으로 판단한다.
- 터치 타겟은 `hitSize.min`(48dp) 이상으로 잡는다.
- 에뮬레이터에서 로컬 서버는 `localhost` 가 아니라 `10.0.2.2` 다.

## 알려진 사항

- `.npmrc` 에 `legacy-peer-deps=true` 가 있다. Expo SDK 57 의 웹 전용 transitive
  의존성(`react-dom`)이 peer 범위를 벗어나 순정 `npm install` 이 실패하기 때문이다.
  `npx expo install` 이 내부적으로 쓰는 정책과 같다.
