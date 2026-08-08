const { getDefaultConfig } = require('expo/metro-config');

/**
 * SVG 를 React 컴포넌트로 import 할 수 있게 한다.
 * (`import Icon from '@/assets/icons/x.svg'` → `<Icon width={24} color="..." />`)
 *
 * Figma 에서 내보낸 아이콘을 그대로 쓰기 위한 설정이다. 아이콘을 PNG 로 받으면
 * 태블릿 해상도에서 뭉개지고 색상 변경도 불가능하다.
 */
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
