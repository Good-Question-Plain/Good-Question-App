import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, hitSize, radius, shadow, spacing } from '@/shared/theme';

import { Appear } from './Appear';
import { ChevronDownIcon } from './icons';
import { InitialBadge } from './InitialBadge';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ChildSwitcherOption {
  id: string;
  name: string;
  /** 직접 올린 프로필 사진. 있으면 이름 첫 글자 대신 사진이 뜬다. */
  photoUrl?: string | null;
}

export interface ChildSwitcherProps {
  /** 지금 쓰고 있는 아이 */
  name: string;
  /** 지금 쓰고 있는 아이가 올린 사진. 있으면 알약에도 사진이 뜬다. */
  photoUrl?: string | null;
  /** 펼쳤을 때 고를 수 있는 아이들 */
  options: readonly ChildSwitcherOption[];
  onSelect: (id: string) => void;
  /**
   * 알약이 놓이는 바탕색.
   *
   * 디자인은 흰 페이지 위의 `#F8F9FA` 알약인데, 앱의 기본 페이지 배경이 그
   * `#F8F9FA` 라 그 위에서는 알약이 사라진다. 그래서 화면 바탕에 맞춰 뒤집는다.
   */
  tone?: 'background' | 'surface';
  style?: ViewStyle;
}

/**
 * 지금 쓰는 아이를 보여주고, 누르면 바로 아래로 목록이 펼쳐지는 알약 (Figma 181:889).
 *
 * 펼친 모습은 알약이 그대로 늘어난 형태다 — 첫 줄이 알약 자리를 덮고(화살표만
 * 뒤집힌다) 그 아래로 아이들이 붙는다. 그래서 목록은 알약의 화면 좌표를 재서
 * 같은 자리에 겹쳐 그린다.
 *
 * 아이 이름 말고 도메인 타입은 알지 않는다. 목록을 넘기고 고른 id 를 돌려받는 게 전부다.
 */
export function ChildSwitcher({
  name,
  photoUrl,
  options,
  onSelect,
  tone = 'background',
  style,
}: ChildSwitcherProps): React.JSX.Element {
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const toneStyle = tone === 'surface' ? styles.onSurface : styles.onBackground;
  const close = (): void => setAnchor(null);

  const open = (): void => {
    // 목록을 알약 위에 정확히 겹치려면 화면 기준 좌표가 필요하다.
    anchorRef.current?.measureInWindow((x, y, width) => setAnchor({ x, y, width }));
  };

  return (
    <View ref={anchorRef} collapsable={false} style={style}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`사용 중인 아이 ${name}, 눌러서 바꾸기`}
        accessibilityState={{ expanded: anchor !== null }}
        onPress={open}
        style={[styles.row, styles.pill, toneStyle]}
      >
        <InitialBadge name={name} size={BADGE_SIZE} photoUrl={photoUrl} />
        <Text variant="chip" numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <ChevronDownIcon width={14} height={14} color={colors.textStrong} />
      </PressableScale>

      <Modal
        visible={anchor !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        {/* 바깥을 누르면 닫힌다. 목록보다 뒤에 깔아 목록 안 탭은 가로채지 않는다. */}
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="닫기" onPress={close} />

        {anchor !== null && (
          <Appear
            style={[styles.card, toneStyle, { left: anchor.x, top: anchor.y, width: anchor.width }]}
          >
            {/* 첫 줄은 알약 자리를 그대로 덮는다. 화살표만 뒤집혀 "접기"가 된다. */}
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="목록 접기"
              onPress={close}
              style={[styles.row, styles.rowDivided]}
            >
              <InitialBadge name={name} size={BADGE_SIZE} photoUrl={photoUrl} />
              <Text variant="chip" numberOfLines={1} style={styles.name}>
                {name}
              </Text>
              <ChevronDownIcon
                width={14}
                height={14}
                color={colors.textStrong}
                style={styles.chevronUp}
              />
            </PressableScale>

            {options.map((option, index) => (
              <PressableScale
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={option.name}
                accessibilityState={{ selected: option.name === name }}
                onPress={() => {
                  close();
                  onSelect(option.id);
                }}
                style={[styles.row, index < options.length - 1 && styles.rowDivided]}
              >
                <InitialBadge name={option.name} size={BADGE_SIZE} photoUrl={option.photoUrl} />
                <Text variant="chip" numberOfLines={1} style={styles.name}>
                  {option.name}
                </Text>
              </PressableScale>
            ))}
          </Appear>
        )}
      </Modal>
    </View>
  );
}

interface Anchor {
  x: number;
  y: number;
  width: number;
}

const BADGE_SIZE = 26; // 디자인 실측

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    // 디자인은 43 이지만 줄이 위아래로 붙어 있어 hitSlop 으로 넓힐 수 없다.
    // 아이가 누르는 목록이라 터치 권장치를 지키는 쪽을 택했다.
    minHeight: hitSize.min,
    paddingHorizontal: 14, // 디자인 실측
  },
  pill: {
    borderRadius: radius.sm,
  },
  card: {
    position: 'absolute',
    borderRadius: radius.sm,
    // 디자인엔 그림자가 없지만, 알약과 바탕이 같은 계열이라 떠 있는 게 보이지 않는다.
    ...shadow.sm,
  },
  rowDivided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  /** 페이지가 #F8F9FA 인 화면. 대비를 유지하려고 디자인과 색을 뒤집는다. */
  onBackground: {
    backgroundColor: colors.surface,
  },
  /** 페이지가 흰 화면. 디자인 그대로 #F8F9FA 를 쓴다. */
  onSurface: {
    backgroundColor: colors.background,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  // 이름이 길면 알약이 헤더를 밀어내지 않도록 폭을 제한한다 (디자인엔 두 글자만 있다).
  name: {
    maxWidth: 120,
  },
});
