# features

기능(도메인) 단위 폴더. **여기서만 도메인 지식이 존재한다.**

## 폴더 하나의 표준 모양

```
src/features/<feature-name>/
├── api/          # 서버 호출 + TanStack Query 훅 (queryKey 도 여기)
├── components/   # 이 기능에서만 쓰는 컴포넌트
├── hooks/        # 이 기능에서만 쓰는 훅
├── model/        # 타입, zustand 스토어, 순수 계산 로직
├── screens/      # 라우트가 렌더링하는 화면 컴포넌트
└── index.ts      # ← 외부에 공개할 것만 여기서 export (public API)
```

없는 폴더는 만들지 않는다. `model` 하나뿐인 feature도 정상이다.

## 규칙 3개

1. **feature 내부 파일을 밖에서 직접 import 하지 않는다.**
   `@/features/quiz` (O) / `@/features/quiz/model/store` (X)
   → 리팩터링할 때 고칠 파일이 `index.ts` 하나로 줄어든다.

2. **feature 끼리 직접 import 하지 않는다.**
   공유가 필요하면 `@/shared` 로 올리거나, 상위(화면·라우트)에서 조립한다.
   순환 참조는 여기서 대부분 생긴다.

3. **`src/app` 의 라우트 파일은 얇게 유지한다.**
   라우트는 "어떤 화면을 보여줄지"만 정하고, 실제 화면은 feature 의 `screens` 에 둔다.

   ```tsx
   // src/app/quiz/[id].tsx
   import { QuizDetailScreen } from '@/features/quiz';

   export default QuizDetailScreen;
   ```

## 예시

```ts
// src/features/quiz/api/queries.ts
import { useQuery } from '@tanstack/react-query';

import { request } from '@/shared/api';

import type { Quiz } from '../model/types';

export const quizKeys = {
  all: ['quiz'] as const,
  detail: (id: string) => [...quizKeys.all, id] as const,
};

export function useQuiz(id: string) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => request<Quiz>({ url: `/quizzes/${id}` }),
  });
}
```

```ts
// src/features/quiz/index.ts
export { QuizDetailScreen } from './screens/QuizDetailScreen';
export { useQuiz, quizKeys } from './api/queries';
export type { Quiz } from './model/types';
```
