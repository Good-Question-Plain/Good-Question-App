import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { MicIcon, PressableScale, Text } from '@/shared/ui';

export interface MicControlProps {
  /**
   * `waiting` 은 아직 아이 차례가 아닌 상태(디자인 86:410),
   * `listening` 은 아이 말을 받는 상태(디자인 176:747)다.
   */
  state: 'waiting' | 'listening';
  onPress?: () => void;
}

/**
 * 화면 아래 가운데의 큰 마이크.
 *
 * 아이가 "지금 내가 말해도 되는지"를 이것만 보고 알 수 있어야 해서, 상태에 따라
 * 크기·색·주변 고리가 전부 달라진다. 회색 원 하나면 못 누르는 상태다.
 */
export function MicControl({ state, onPress }: MicControlProps): React.JSX.Element {
  if (state === 'waiting') {
    return (
      <View style={styles.column}>
        <View style={styles.waitingButton}>
          <MicIcon width={34} height={34} color={colors.textInverse} />
        </View>
        {/* 디자인은 "아니예요" 지만 맞춤법이 틀렸다. 아이가 글을 배우는 앱이라 고쳤다. */}
        <Text variant="label" color="textStrong" align="center">
          아직 말할 차례가 아니에요
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.column}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="말하기"
        onPress={onPress}
        style={styles.outerRing}
      >
        <View style={styles.innerRing}>
          <View style={styles.listeningButton}>
            <MicIcon width={29} height={29} color={colors.textInverse} />
          </View>
        </View>
      </PressableScale>
      <Text variant="captionSmallStrong" color="primaryTextDeep" align="center">
        듣고 있어요
      </Text>
    </View>
  );
}

// 전부 디자인 실측. 고리는 바깥 117 → 안쪽 93 → 버튼 69 순으로 겹친다.
const OUTER = 117;
const INNER = 93;
const BUTTON = 69;
const WAITING = 96;

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    gap: spacing.md,
  },
  waitingButton: {
    width: WAITING,
    height: WAITING,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceInactive,
  },
  outerRing: {
    width: OUTER,
    height: OUTER,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: radius.full,
    // 고리 색은 디자인에 투명도까지 지정돼 있다 (primary/300 49%, primary/500 50%).
    borderColor: 'rgba(255, 194, 102, 0.49)',
  },
  innerRing: {
    width: INNER,
    height: INNER,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: radius.full,
    borderColor: 'rgba(255, 146, 0, 0.5)',
  },
  listeningButton: {
    width: BUTTON,
    height: BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
