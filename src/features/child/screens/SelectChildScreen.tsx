import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button, ChildProfileModal, EmptyState, Screen } from '@/shared/ui';

import { useActiveChild } from '../hooks/useActiveChild';
import { FALLBACK_AVATAR_ID } from '../model/types';

/**
 * 아이 프로필 선택 (Figma 86:734).
 *
 * **모달로 띄운다.** 시안에는 두 벌이 있다 — 전체 화면(`92:889`, "만나볼까요? /
 * 시작하기")과 모달(`86:734`, "아이 프로필 선택 / 변경하기"). 사용자 결정으로
 * 모달 쪽을 쓴다. 다만 시안의 모달은 뒤에 마이페이지가 깔려 있는데, 여기서는
 * **배경 없이** 딤 위에 모달만 띄운다 (로그인 직후라 뒤에 보일 화면이 없다).
 *
 * 닫기(X)를 넘기지 않는다. 아이를 고르기 전에는 갈 데가 없어서, 닫을 수 있게
 * 두면 아무것도 없는 화면에 갇힌다.
 *
 * 고른 아이는 전역 스토어에 남아 홈·리포트까지 그대로 이어진다.
 */
export function SelectChildScreen(): React.JSX.Element {
  const router = useRouter();
  const { activeChild, children, isLoading, isError, retry, selectChild } = useActiveChild();

  /**
   * 목록을 못 받았을 때.
   *
   * 모달 안에 오류를 넣으면 "고르라"는 제목 아래 "못 불러왔다"가 붙어 앞뒤가
   * 맞지 않는다. 안내와 할 일만 남긴다.
   */
  if (isError) {
    return (
      <Screen>
        <View style={styles.notice}>
          <EmptyState
            title="아이 목록을 불러오지 못했어요"
            description="연결 상태를 확인하고 다시 시도해주세요"
            style={styles.noticeText}
          />
          <Button label="다시 시도" size="lg" onPress={retry} style={styles.noticeCta} />
        </View>
      </Screen>
    );
  }

  // 아직 아이가 하나도 없으면 고를 게 없다 — 만들기 화면이 다음 단계다.
  // 가입 직후 첫 진입이 이 경우다.
  if (!isLoading && children.length === 0) {
    return (
      <Screen>
        <View style={styles.notice}>
          <EmptyState
            title="아직 등록된 아이가 없어요"
            description="아이를 등록하면 이야기를 시작할 수 있어요"
            style={styles.noticeText}
          />
          <Button
            label="아이 등록하기"
            size="lg"
            onPress={() => router.replace('/child/create')}
            style={styles.noticeCta}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ChildProfileModal
        visible={!isLoading}
        profiles={children.map((child) => ({
          id: child.id,
          name: child.name,
          avatarId: child.avatarId ?? FALLBACK_AVATAR_ID,
          // 사진을 올린 아이는 첫 글자 뱃지 대신 그 사진이 뜬다.
          photoUrl: child.photoUrl,
        }))}
        activeId={activeChild?.id ?? null}
        onSelect={(id) => {
          selectChild(id);
          router.replace('/story');
        }}
        onAdd={() => router.push('/child/create')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  /** 디자인에 없는 상태다 — 막다른 길이 되지 않게 직접 만들었다. */
  notice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  // `EmptyState` 는 기본이 `flex: 1` + 큰 세로 여백이라, 버튼과 한 덩어리로
  // 가운데 모으려면 둘 다 꺼야 한다.
  noticeText: {
    flex: 0,
    paddingVertical: 0,
  },
  // `Button` 은 기본이 `alignSelf: 'flex-start'` 라 부모의 가운데 정렬을 덮어쓴다.
  noticeCta: {
    alignSelf: 'center',
  },
});
