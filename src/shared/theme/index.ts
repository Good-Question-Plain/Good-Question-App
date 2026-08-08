import { colors } from './colors';
import { motion } from './motion';
import { hitSize, radius, shadow, spacing } from './spacing';
import { fontFamily, typography } from './typography';

export { avatarTints, colors, storyTints, type ColorToken } from './colors';
export { fontAssets } from './fonts';
export { motion } from './motion';
export { hitSize, radius, shadow, spacing, type RadiusToken, type SpacingToken } from './spacing';
export { fontFamily, typography, type TypographyVariant } from './typography';

/** 토큰 전체를 한 번에 받고 싶을 때 쓰는 묶음. 개별 import 를 더 권장한다. */
export const theme = {
  colors,
  spacing,
  radius,
  shadow,
  hitSize,
  typography,
  fontFamily,
  motion,
} as const;

export type Theme = typeof theme;
