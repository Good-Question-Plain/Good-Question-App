import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type ViewStyle,
} from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

import { Text } from './Text';

export interface OtpInputProps {
  /**
   * 자릿수.
   *
   * **시안은 6칸인데 서버가 보내는 코드는 8자리다** (Supabase 의 Email OTP
   * Length 설정값). 화면이 서버를 따라가야 해서 호출부가 8을 넘긴다.
   * 디자이너 확인 대상.
   */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

/**
 * 인증코드 입력. 한 칸에 한 글자씩 보이는 형태.
 *
 * 화면에는 칸이 여러 개로 보이지만 **실제 입력은 뒤에 숨긴 TextInput 하나**가
 * 받는다. 칸마다 TextInput 을 두면 지우기(백스페이스)로 앞 칸에 돌아가는 처리,
 * 붙여넣기, 자동완성(SMS/이메일 코드)이 전부 어긋난다. 숨긴 입력 하나면
 * 그 세 가지가 공짜로 따라온다.
 */
export function OtpInput({ length = 6, value, onChange, style }: OtpInputProps): React.JSX.Element {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.padEnd(length).slice(0, length).split('');
  // 커서가 놓일 칸: 아직 다 채우지 않았으면 다음 빈 칸, 다 채웠으면 마지막 칸.
  const activeIndex = Math.min(value.length, length - 1);

  const handleChangeText = (next: string): void => {
    const digitsOnly = next.replace(/[^0-9]/g, '').slice(0, length);
    onChange(digitsOnly);
  };

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>): void => {
    // 빈 상태에서 백스페이스를 눌러도 아무 일도 없도록 (기본 동작이면 충분하지만
    // 일부 IME 가 이벤트를 흘려서 명시적으로 잘라둔다)
    if (event.nativeEvent.key === 'Backspace' && value.length === 0) {
      onChange('');
    }
  };

  return (
    <Pressable style={[styles.row, style]} onPress={() => inputRef.current?.focus()}>
      {digits.map((digit, index) => {
        const isActive = focused && index === activeIndex;
        const isFilled = digit.trim().length > 0;

        return (
          <View
            key={index}
            style={[styles.cell, isFilled && styles.cellFilled, isActive && styles.cellActive]}
          >
            <Text variant="otp">{digit.trim()}</Text>
          </View>
        );
      })}

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  /**
   * 칸 하나.
   *
   * 폭이 고정이 아니라 **남는 폭을 나눠 갖고 44 에서 멈춘다.**
   * 디자인 실측은 44(6자리 기준)인데, 서버가 8자리 코드를 보내면
   * 44×8 + 간격 7칸 = 408 이라 카드 안쪽 폭(420 - 좌우 32) 356 을 넘친다.
   * `maxWidth` 로 캡을 씌워 **6자리일 때는 디자인 그대로 44**, 8자리면
   * 알아서 좁아지게 했다.
   */
  cell: {
    flex: 1,
    maxWidth: 44, // 디자인 실측
    height: 52, // 디자인 실측
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8, // 디자인 실측
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cellFilled: {
    borderColor: colors.borderStrong,
  },
  cellActive: {
    borderColor: colors.primarySoft,
  },
  /**
   * 실제 입력을 받는 필드. 화면에는 보이지 않아야 하지만 `display: none` 이나
   * `opacity: 0` 이면 안드로이드에서 포커스가 잡히지 않는다. 그래서 칸들 위에
   * 투명하게 겹쳐 깔아둔다.
   */
  hiddenInput: {
    ...typography.otp,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: 'transparent',
    opacity: 0.01,
  },
});
