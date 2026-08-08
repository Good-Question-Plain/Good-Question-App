/**
 * `.svg` 를 React 컴포넌트로 import 할 수 있게 해주는 타입 선언.
 * 실제 변환은 metro.config.js 의 react-native-svg-transformer 가 담당한다.
 */
declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FC<SvgProps>;
  export default content;
}
