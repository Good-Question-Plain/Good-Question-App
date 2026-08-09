/**
 * 이야기 한 편의 대본.
 *
 * 실제로는 장면마다 서버가 나레이션·질문·미션을 내려주고, 아이 답변에 따라
 * 다음 장면이 달라진다. 여기 있는 건 화면 확인용 고정 대본이다.
 */

export interface StoryLine {
  /** 말하는 등장인물. 뱃지에 첫 글자가 들어간다. */
  speaker: string;
  text: string;
}

export interface StoryScene {
  /** 화면 위쪽 패널에 나오는 이야기 줄거리. TTS 로도 읽어준다. */
  narration: string;
  /** 등장인물이 아이에게 던지는 질문 */
  question: StoryLine;
  /** 이 장면에 미션이 있으면 줄거리 패널 아래에 한 칸 더 붙는다 */
  mission?: string;
  /**
   * 아이가 말했다고 가정할 문장.
   *
   * STT 가 붙기 전까지 마이크를 눌렀을 때 대신 보여준다. 연동되면 사라진다.
   */
  sampleReply: string;
}

export interface StoryScript {
  storyId: string;
  scenes: readonly StoryScene[];
}

/**
 * 디자인(161:1158)의 대본은 "방귀뀌는 며느리"로 되어 있는데, 본문이 실제 서비스에
 * 쓸 수 없는 자리표시 문장이라 그대로 옮기지 않았다. 화면 구조(줄거리 → 질문 →
 * 아이 답변 → 미션)와 3/8 진행도는 디자인 그대로 두고, 문장만 이미 있는 목데이터
 * 이야기(아기돼지 삼형제)로 새로 썼다.
 *
 * 3번째 장면의 질문·답변은 디자인에 적힌 문장 그대로다.
 */
const PIGS_SCRIPT: StoryScript = {
  storyId: '3',
  scenes: [
    {
      narration:
        '옛날 옛적 숲속 마을에 아기 돼지 삼형제가 살았어요. 어느 날 삼형제는 각자 자기 집을 짓기로 했답니다.',
      question: { speaker: '첫째 돼지', text: '우리 이제 어떤 집부터 지어볼까?' },
      sampleReply: '음... 나는 제일 튼튼한 집이 좋을 것 같아!',
    },
    {
      narration:
        '첫째는 지푸라기로, 둘째는 나무로 뚝딱 집을 지었어요. 셋째는 하루 종일 벽돌을 하나씩 쌓았지요.',
      question: { speaker: '셋째 돼지', text: '내 집은 왜 이렇게 오래 걸릴까?' },
      sampleReply: '벽돌은 무거우니까 천천히 쌓아야 해서 그런 것 같아.',
    },
    {
      narration:
        '그때 배가 고픈 늑대가 숲 뒤에서 삼형제를 몰래 지켜보고 있었어요. 늑대는 첫째의 집으로 살금살금 다가갔습니다.',
      question: { speaker: '첫째 돼지', text: '늑대가 문을 두드리면 우리는 어떻게 해야 할까?' },
      sampleReply: '음... 나는 늑대가 무서워서 문을 안 열 거야!',
    },
    {
      narration:
        '늑대가 후- 하고 바람을 불자 지푸라기 집이 폭삭 무너졌어요. 첫째는 둘째의 집으로 달려갔습니다.',
      question: { speaker: '둘째 돼지', text: '형, 우리 집도 무너지면 어디로 가지?' },
      sampleReply: '셋째 형 집이 제일 튼튼하니까 거기로 가자!',
    },
    {
      narration:
        '삼형제는 셋째의 벽돌집에 모두 모였어요. 늑대가 아무리 불어도 집은 꿈쩍하지 않았죠.',
      question: { speaker: '셋째 돼지', text: '늑대가 굴뚝으로 들어오려고 해! 어떡하지?' },
      mission: '늑대를 다치게 하지 않고 돌려보낼 방법을 같이 찾아볼까?',
      sampleReply: '굴뚝 아래에 따뜻한 물을 놓아두면 놀라서 나갈 것 같아.',
    },
    {
      narration: '삼형제의 꾀에 놀란 늑대는 굴뚝에서 폴짝 뛰어나와 숲으로 도망쳤어요.',
      question: { speaker: '둘째 돼지', text: '늑대는 왜 우리 집에 오고 싶었을까?' },
      sampleReply: '배가 너무 고파서 그런 게 아닐까?',
    },
    {
      narration: '다음 날 아침, 삼형제는 무너진 집을 다시 짓기로 했어요. 이번에는 셋이 함께요.',
      question: { speaker: '첫째 돼지', text: '혼자 지을 때랑 같이 지을 때, 뭐가 달라?' },
      sampleReply: '같이 하면 더 빠르고, 힘들 때 도와줄 수 있어!',
    },
    {
      narration:
        '세 채의 튼튼한 벽돌집이 나란히 완성되었어요. 삼형제는 오래오래 사이좋게 지냈답니다.',
      question: { speaker: '셋째 돼지', text: '오늘 이야기에서 제일 기억에 남는 건 뭐야?' },
      sampleReply: '급하게 하는 것보다 튼튼하게 하는 게 중요하다는 거!',
    },
  ],
};

const SCRIPTS: readonly StoryScript[] = [PIGS_SCRIPT];

/**
 * 대본이 준비된 이야기만 대화를 시작할 수 있다.
 * 아직 없는 이야기는 화면에서 "준비 중" 으로 안내한다.
 */
export function findScript(storyId: string): StoryScript | undefined {
  return SCRIPTS.find((script) => script.storyId === storyId);
}
