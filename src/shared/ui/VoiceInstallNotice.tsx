import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useKoreanVoice } from '@/shared/hooks/useKoreanVoice';
import { spacing } from '@/shared/theme';

import { Button } from './Button';
import { Modal } from './Modal';
import { Text } from './Text';

/**
 * 기기에 한국어 음성이 없을 때 **앱을 켜자마자 한 번** 알려주는 안내.
 *
 * **읽어주기가 안 되면 이 앱은 반쪽이 된다.** 아이가 아직 글을 빠르게 못 읽는다는 게
 * 전제라(PRD) 나레이션을 소리로 들려주는 건 부가 기능이 아니다. 그런데 음성이 없어도
 * `expo-speech` 는 에러 없이 조용히 넘어가서 **아무도 눈치채지 못한다** — 시연
 * 태블릿이 실제로 그 상태였다(설치된 음성 6개 중 한국어 0개).
 *
 * ## 왜 여기(앱 시작)인가
 *
 * 음성 설치는 **보호자가 하는 일**이고 시스템 설정으로 나갔다 와야 한다. 아이가
 * 이야기를 보는 중에 띄우면 흐름이 끊긴다. 앱을 켠 직후는 보호자가 기기를 쥐고 있는
 * 순간이라 그때 한 번만 묻는다.
 *
 * **"나중에" 를 고르면 그 실행 동안은 다시 묻지 않는다.** 매번 막아서면 설치할 수
 * 없는 사정이 있는 사람은 앱을 쓸 때마다 걸린다.
 *
 * 설치하고 돌아오면 `useKoreanVoice` 가 앱 복귀 때 다시 확인해 저절로 닫힌다.
 *
 * **디자인에 없는 화면이다** — 문구와 모양은 임시이고 시안이 나오면 교체 대상이다.
 */
export function VoiceInstallNotice(): React.JSX.Element | null {
  const { status, openInstaller } = useKoreanVoice();
  const [dismissed, setDismissed] = useState(false);

  if (status !== 'missing' || dismissed) return null;

  return (
    <Modal
      visible
      onDismiss={() => setDismissed(true)}
      onRequestClose={() => setDismissed(true)}
      width={480}
    >
      <View style={styles.body}>
        <Text variant="heading" align="center">
          이야기를 읽어줄 음성이 없어요
        </Text>
        <Text variant="caption" color="textStrong" align="center">
          이 태블릿에 한국어 음성이 설치되어 있지 않아요. 설치하면 아이가 글을 읽지 않아도 이야기를
          소리로 들으며 따라올 수 있어요.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="나중에"
          variant="secondary"
          size="lg"
          style={styles.action}
          onPress={() => setDismissed(true)}
        />
        <Button
          label="설치하러 가기"
          size="lg"
          style={styles.action}
          onPress={() => {
            // 설정으로 나갔다 돌아오면 `useKoreanVoice` 가 다시 확인한다. 여기서
            // 닫아두지 않으면 음성을 안 받고 돌아왔을 때 안내가 그대로 남는다.
            setDismissed(true);
            void openInstaller();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },
  action: {
    flex: 1,
  },
});
