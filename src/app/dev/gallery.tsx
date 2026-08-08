import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useResponsive } from '@/shared/hooks/useResponsive';
import { spacing, typography } from '@/shared/theme';
import {
  BottomTabBar,
  Button,
  Card,
  Divider,
  Input,
  Modal,
  Screen,
  SocialButton,
  StepIndicator,
  Text,
  type TabKey,
} from '@/shared/ui';

/**
 * 개발용 컴포넌트 갤러리 (`/dev/gallery`).
 *
 * 토큰과 공용 컴포넌트를 한눈에 확인하려고 둔 화면이다. 제품 화면이 아니므로
 * 어디서도 링크하지 않는다. 배포 전에 이 파일만 지우면 라우트도 사라진다.
 */
export default function GalleryScreen(): React.JSX.Element {
  const { width, height, breakpoint, isLandscape } = useResponsive();
  const [tab, setTab] = useState<TabKey>('wordbook');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Screen scrollable>
      <View style={styles.page}>
        <Text variant="title">컴포넌트 갤러리</Text>

        <Card flat>
          <Text variant="heading">현재 화면</Text>
          <View style={styles.rows}>
            <Row label="해상도" value={`${Math.round(width)} × ${Math.round(height)} dp`} />
            <Row label="브레이크포인트" value={breakpoint} />
            <Row label="방향" value={isLandscape ? '가로' : '세로'} />
          </View>
        </Card>

        <Card flat>
          <Text variant="heading">타이포그래피</Text>
          <View style={styles.rows}>
            {(Object.keys(typography) as (keyof typeof typography)[]).map((variant) => (
              <Text key={variant} variant={variant}>
                {variant} — 다람쥐 헌 쳇바퀴에 타고파
              </Text>
            ))}
          </View>
        </Card>

        <Card flat>
          <Text variant="heading">버튼</Text>
          <View style={[styles.rows, styles.wrap]}>
            <Button label="Primary" onPress={() => {}} />
            <Button label="Primary 비활성" disabled onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Ghost" variant="ghost" onPress={() => {}} />
            <Button label="Danger" variant="danger" size="lg" onPress={() => {}} />
            <Button label="로딩" loading onPress={() => {}} />
          </View>
        </Card>

        <Card flat>
          <Text variant="heading">입력</Text>
          <View style={styles.rows}>
            <Input label="이메일" placeholder="이메일을 입력하세요" />
            <Input
              label="새 비밀번호"
              placeholder="새 비밀번호"
              helperText="8자 이상, 영문+숫자 조합"
            />
            <Input
              label="새 비밀번호 확인"
              placeholder="새 비밀번호 확인"
              status="success"
              helperText="비밀번호가 일치해요"
            />
            <Input
              label="이메일"
              placeholder="이메일"
              status="error"
              helperText="형식이 올바르지 않아요"
            />
          </View>
        </Card>

        <Card flat>
          <Text variant="heading">단계 표시 · 구분선 · 소셜</Text>
          <View style={styles.rows}>
            <StepIndicator total={3} current={1} />
            <StepIndicator total={3} current={2} />
            <StepIndicator total={3} current={3} />
            <Divider label="또는" />
            <SocialButton provider="google" />
            <SocialButton provider="kakao" />
            <SocialButton provider="naver" />
          </View>
        </Card>

        <Card flat>
          <Text variant="heading">하단 탭</Text>
          <View style={styles.rows}>
            <BottomTabBar active={tab} onSelect={setTab} />
          </View>
        </Card>

        <Button label="모달 열기" variant="secondary" onPress={() => setModalOpen(true)} />

        <Modal visible={modalOpen} onDismiss={() => setModalOpen(false)}>
          <Text variant="heading">정말 탈퇴하시겠어요?</Text>
          <Text variant="caption" color="textStrong">
            탈퇴하면 아래 정보가 삭제돼요
          </Text>
          <View style={styles.modalActions}>
            <Button
              label="취소"
              variant="secondary"
              size="lg"
              onPress={() => setModalOpen(false)}
            />
            <Button
              label="탈퇴하기"
              variant="danger"
              size="lg"
              onPress={() => setModalOpen(false)}
            />
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  rows: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
});
