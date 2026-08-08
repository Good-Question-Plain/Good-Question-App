import type { ReactNode } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
  type ModalProps as RNModalProps,
} from 'react-native';

import { colors, radius, shadow, spacing } from '@/shared/theme';

import { Appear } from './Appear';

export interface ModalProps extends Pick<RNModalProps, 'onRequestClose'> {
  visible: boolean;
  children: ReactNode;
  /** 배경(딤 영역)을 눌렀을 때 닫을지. 파괴적 확인 모달에서는 꺼두는 게 좋다. */
  dismissOnBackdropPress?: boolean;
  onDismiss?: () => void;
  /** 모달 카드 너비. 디자인상 420~480 사이를 쓴다. */
  width?: number;
  cardStyle?: ViewStyle;
}

/**
 * 화면 위에 뜨는 카드형 모달.
 *
 * 딤 배경 + 가운데 정렬 카드까지가 이 컴포넌트의 책임이고, 내용은 전부 children 이다.
 * 안드로이드 뒤로가기는 `onRequestClose` 로 처리된다.
 *
 * 카드는 딤이 깔린 뒤 살짝 커지며 들어온다. 갑자기 나타나면 아이가 놀라고
 * 어디를 봐야 할지 놓치기 쉬워서, 시선이 가운데로 모이도록 한 것이다.
 */
export function Modal({
  visible,
  children,
  dismissOnBackdropPress = true,
  onDismiss,
  onRequestClose,
  width = 480,
  cardStyle,
}: ModalProps): React.JSX.Element {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose ?? onDismiss}
    >
      <View style={styles.backdrop}>
        {/* 배경 탭 영역. 카드보다 뒤에 깔아 카드 내부 탭은 가로채지 않는다. */}
        {dismissOnBackdropPress && (
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="닫기"
            onPress={onDismiss}
          />
        )}
        {/* key 를 visible 에 묶어, 다시 열 때마다 등장 애니메이션이 새로 돈다. */}
        <Appear key={String(visible)} from="scale" style={[styles.card, { width }, cardStyle]}>
          {children}
        </Appear>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  card: {
    padding: 28, // 디자인 실측
    gap: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.md,
  },
});
