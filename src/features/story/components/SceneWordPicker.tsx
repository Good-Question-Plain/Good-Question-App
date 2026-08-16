import { StyleSheet, View } from 'react-native';

import { colors, hitSize } from '@/shared/theme';
import {
  CheckboxCheckedIcon,
  CheckboxIcon,
  ChevronDownIcon,
  PressableScale,
  Text,
} from '@/shared/ui';

import type { SceneVocabulary } from '../api/progressApi';

export interface SceneWordPickerProps {
  words: readonly SceneVocabulary[];
  onToggle: (word: SceneVocabulary) => void;
  /** 펼쳤는지. 화면이 들고 있어야 장면이 바뀔 때 접을 수 있다. */
  expanded: boolean;
  onToggleExpanded: () => void;
  disabled?: boolean;
}

/**
 * 이 장면에 나온 어려운 말들 (Figma `417:602` 접힘 · `417:616` 펼침).
 *
 * 장면 그림 오른쪽 위에 겹쳐 놓이는 **접히는 목록**이다. 첫 줄이 트리거를 겸하고,
 * 화살표를 누르면 나머지 단어가 아래로 펼쳐진다. 줄마다 체크박스가 있어 아이가
 * "이거 모르겠어"를 표시한다. 고른 단어는 리포트의 "궁금해한 어휘"와 단어장이 된다.
 *
 * 놓이는 자리는 화면 쪽에 있다 (`StoryPlayScreen` 의 `wordPicker`) —
 * 그림 기준 오른쪽 19 · 위 11 이 실측값이다.
 *
 * ## 디자인과 다르게 한 것
 *
 * **줄 높이를 33 → 48 로 올렸다.** 줄이 서로 붙어 있어 `hitSlop` 으로 넓힐 수
 * 없고(아이 전환 드롭다운 `ChildSwitcher` 에서 43 → 48 로 올린 것과 같은 이유),
 * 터치 권장치(`hitSize.min`)를 지키는 쪽을 골랐다. 폭 108 은 그대로다.
 *
 * 시안 본문은 자리표시라 Inter · 13.2px 로 그려져 있다. 프로젝트 규칙대로
 * 토큰(`chip` = Pretendard SemiBold 13)으로 보정했다.
 */
export function SceneWordPicker({
  words,
  onToggle,
  expanded,
  onToggleExpanded,
  disabled = false,
}: SceneWordPickerProps): React.JSX.Element | null {
  if (words.length === 0) return null;

  // 첫 줄이 트리거를 겸한다. 단어가 하나뿐이면 펼칠 것이 없어 화살표를 숨긴다.
  const [head, ...rest] = words;
  const canExpand = rest.length > 0;
  const visible = expanded ? words : [head];

  return (
    <View style={styles.container}>
      {visible.map((word, index) => {
        const isLast = index === visible.length - 1;
        const Checkbox = word.selected ? CheckboxCheckedIcon : CheckboxIcon;

        return (
          <View key={word.id} style={[styles.row, !isLast && styles.rowDivided]}>
            <PressableScale
              accessibilityRole="checkbox"
              accessibilityLabel={word.word}
              accessibilityState={{ checked: word.selected, disabled }}
              disabled={disabled}
              scaleTo={0.96}
              onPress={() => onToggle(word)}
              style={styles.wordArea}
            >
              <Text variant="chip" numberOfLines={1}>
                {word.word}
              </Text>
              <Checkbox width={16} height={16} color={colors.text} />
            </PressableScale>

            {/* 화살표는 첫 줄에만. 누르면 나머지 단어가 펼쳐진다. */}
            {index === 0 && canExpand && (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={expanded ? '단어 목록 접기' : '단어 목록 펼치기'}
                accessibilityState={{ expanded }}
                scaleTo={0.9}
                onPress={onToggleExpanded}
                style={styles.chevronArea}
              >
                <ChevronDownIcon
                  width={14}
                  height={14}
                  color={colors.textStrong}
                  // 펼쳐지면 위를 가리킨다 (시안 417:619 가 180도 돌린 같은 벡터다).
                  style={expanded ? styles.chevronUp : undefined}
                />
              </PressableScale>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 108, // 디자인 실측
    borderRadius: 10, // 디자인 실측
    backgroundColor: colors.background,
    // 줄의 모서리를 컨테이너 곡률로 잘라낸다 (시안은 첫/끝 줄에만 radius 를 준다).
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // 디자인은 33 인데 줄이 붙어 있어 hitSlop 으로 못 넓힌다. 위 주석 참고.
    height: hitSize.min,
    backgroundColor: colors.surfaceInfo,
  },
  rowDivided: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  wordArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingLeft: 14, // 디자인 실측
    // 체크박스가 왼쪽 68 에 오도록 (108 - 68 - 16 = 24).
    paddingRight: 24,
  },
  chevronArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    // 화살표는 왼쪽 86 자리다. 체크박스 오른쪽 끝(84)에서 남는 폭을 차지한다.
    width: 24,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
});
