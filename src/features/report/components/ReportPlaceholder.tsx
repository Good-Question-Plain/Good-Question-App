import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button, EmptyState } from '@/shared/ui';

export interface ReportPlaceholderProps {
  title: string;
  description?: string;
  /** 스피너를 함께 보여준다. 생성이 도는 동안 쓴다. */
  busy?: boolean;
  actionLabel?: string;
  actionLoading?: boolean;
  onAction?: () => void;
}

/**
 * 리포트 본문 대신 들어가는 안내.
 *
 * **디자인에 없는 상태다.** 시안은 리포트가 이미 만들어져 있는 경우만 그려져
 * 있는데, 서버는 리포트를 자동으로 만들지 않는다 — 없을 수도, 만드는 중일 수도,
 * 실패했을 수도 있다. 그 셋을 보호자에게 알려줄 자리가 필요하다.
 *
 * 새 모양을 만들지 않고 이미 있는 `EmptyState` + `Button` 을 그대로 쓴다.
 * 문구 톤도 다른 빈 상태들과 맞췄다(보호자가 읽는 화면이라 존댓말).
 */
export function ReportPlaceholder({
  title,
  description,
  busy = false,
  actionLabel,
  actionLoading = false,
  onAction,
}: ReportPlaceholderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <EmptyState title={title} description={description} style={styles.text} />

      {busy && <ActivityIndicator color={colors.primary} />}

      {actionLabel !== undefined && (
        <Button label={actionLabel} size="lg" loading={actionLoading} onPress={onAction} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  // EmptyState 는 기본이 flex:1 이라 그대로 두면 버튼을 화면 밖으로 밀어낸다.
  text: {
    flex: 0,
  },
});
