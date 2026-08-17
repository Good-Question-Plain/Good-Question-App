import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { colors, motion, radius, spacing, type ColorToken } from '@/shared/theme';
import { MicIcon, PressableScale, Text } from '@/shared/ui';

/**
 * 마이크가 가질 수 있는 상태. 가이드 프레임(86:448)이 정의한 **3가지**다 —
 * 그 프레임의 부제가 "대화 화면에서 사용되는 마이크 버튼의 3가지 상태" 다.
 *
 * **`blocked`("아직 말할 차례가 아니에요")는 없앴다.** 옛 도입 시안(86:410)에만
 * 있던 상태인데, 그 시안이 `380:342` 로 교체되면서 마이크 자체가 사라졌다.
 * 읽어주는 동안은 마이크가 **잠긴 게 아니라 없는** 것이다 — 화면이 `isReading`
 * 으로 판단해 아예 그리지 않는다 (`StoryPlayScreen`).
 */
export type MicState = 'ready' | 'listening' | 'processing';

export interface MicControlProps {
  state: MicState;
  /** `ready` / `listening` 에서만 눌린다. */
  onPress?: () => void;
}

/**
 * 화면 아래 가운데의 큰 마이크 (Figma 86:448 가이드 / 86:410 / 161:1158).
 *
 * 아이가 "지금 내가 말해도 되는지"를 이것만 보고 알아야 해서 상태마다 색·크기·
 * 주변 고리가 전부 다르다. 글을 못 읽는 아이도 색으로 구분할 수 있어야 한다.
 */
export function MicControl({ state, onPress }: MicControlProps): React.JSX.Element {
  const { label, color } = LABELS[state];

  return (
    <View style={styles.column}>
      {state === 'listening' ? (
        <ListeningMic onPress={onPress} />
      ) : (
        <SolidMic state={state} onPress={onPress} />
      )}
      <Text variant="labelSmall" color={color} align="center">
        {label}
      </Text>
    </View>
  );
}

/** 고리 없이 원 하나로 그려지는 상태들. 색만 다르다. */
function SolidMic({
  state,
  onPress,
}: {
  state: Exclude<MicState, 'listening'>;
  onPress?: () => void;
}): React.JSX.Element {
  const circle = (
    <View style={[styles.solidButton, { backgroundColor: SOLID_BACKGROUND[state] }]}>
      <MicIcon width={SOLID_ICON} height={SOLID_ICON} color={colors.textInverse} />
    </View>
  );

  if (state === 'processing') {
    return (
      <View style={styles.processingWrap}>
        <ProcessingRing />
        {circle}
      </View>
    );
  }

  return (
    <PressableScale accessibilityRole="button" accessibilityLabel="말하기" onPress={onPress}>
      {circle}
    </PressableScale>
  );
}

/** 듣는 중. 버튼이 작아지고 옅은 고리 두 겹이 감싼다 (디자인 176:747). */
function ListeningMic({ onPress }: { onPress?: () => void }): React.JSX.Element {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="말 그만하기"
      onPress={onPress}
      style={styles.outerRing}
    >
      <View style={styles.innerRing}>
        <View style={styles.listeningButton}>
          <MicIcon width={LISTENING_ICON} height={LISTENING_ICON} color={colors.textInverse} />
        </View>
      </View>
    </PressableScale>
  );
}

/**
 * 정리 중임을 알리는 회전 고리 (디자인 86:477).
 *
 * 디자인은 원의 일부만 그려진 호를 기울여 둔 모양이다. 테두리 네 변 중 두 변만
 * 색을 넣으면 같은 호가 나온다 — 에셋으로 뽑으면 회전이 안 붙는다.
 */
function ProcessingRing(): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  // Appear 와 같은 방식. useRef 로 잡으면 렌더 중 ref 접근이 된다.
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reducedMotion) return;

    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: motion.duration.spin,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [reducedMotion, spin]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.processingRing,
        {
          transform: [
            {
              rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
            },
          ],
        },
      ]}
    />
  );
}

const LABELS: Record<MicState, { label: string; color: ColorToken }> = {
  // 도입 화면(86:410)의 문구. 디자인은 "아니예요" 지만 맞춤법이 틀렸다 —
  // 아이가 글을 배우는 앱이라 고쳤다.
  ready: { label: '말할 준비 완료', color: 'text' },
  listening: { label: '듣고 있어요', color: 'primaryText' },
  processing: { label: '말한 내용을 정리하고 있어요', color: 'text' },
};

const SOLID_BACKGROUND: Record<Exclude<MicState, 'listening'>, string> = {
  ready: colors.primaryReady,
  processing: colors.surfaceBusy,
};

// 전부 디자인 실측. 고리가 붙는 `listening` 만 버튼이 작아지고, 나머지는 96 이다.
const SOLID_SIZE = 96;
const SOLID_ICON = 34;
const OUTER_RING = 117;
const INNER_RING = 93;
const LISTENING_SIZE = 69;
const LISTENING_ICON = 29;
const PROCESSING_RING = 108;

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    gap: spacing.md,
  },
  solidButton: {
    width: SOLID_SIZE,
    height: SOLID_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  processingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingRing: {
    position: 'absolute',
    width: PROCESSING_RING,
    height: PROCESSING_RING,
    borderWidth: 4, // 디자인 실측
    borderRadius: radius.full,
    borderColor: colors.textMuted,
    // 네 변 중 두 변을 비워 호를 만든다.
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  outerRing: {
    width: OUTER_RING,
    height: OUTER_RING,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: radius.full,
    borderColor: colors.listeningRingOuter,
  },
  innerRing: {
    width: INNER_RING,
    height: INNER_RING,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: radius.full,
    borderColor: colors.listeningRingInner,
  },
  listeningButton: {
    width: LISTENING_SIZE,
    height: LISTENING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
