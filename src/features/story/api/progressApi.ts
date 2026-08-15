import { request } from '@/shared/api';

/**
 * 학습 세션 API (`/progress`).
 *
 * 경로에 `/api` 를 붙이지 않는다 — 이 그룹은 명세 상세 페이지에도 `/progress/...`
 * 로 적혀 있다 (근거는 `features/auth/api/authApi.ts` 주석).
 *
 * **여기가 `session_id` 의 출처다.** 이야기 후 활동(`activityApi.ts`)이 전부
 * `session_id` 를 요구하므로, 이 그룹이 붙어야 활동도 연결된다.
 *
 * 아직 화면에는 붙이지 않았다 — BE 미구현이고, 대화 화면의 대본·장면이
 * 목데이터(`model/script.ts`)라 한꺼번에 갈아끼워야 한다.
 */

/** 한 장면에서 무엇을 하는지. 화면의 마이크 상태·패널 구성이 여기서 갈린다. */
export type StepKind = 'narration' | 'dialogue' | 'mission';

/** 미션 패널에 들어가는 내용. 단계 진입 시점에는 항상 null 이고 발화 응답으로 온다. */
export interface StepMission {
  /** 아이가 무엇을 말해야 하는지. 미션 패널의 본문이다. */
  condition: string;
  /** 예시 문구들. 아이가 막혔을 때 힌트로 보여준다. */
  examples: string[];
}

export interface SessionStep {
  stepIndex: number;
  sceneCount: number;
  kind: StepKind;
  sceneId: string;
  /** 왼쪽 줄거리 패널에 들어가는 본문. `{child_name}` 은 서버가 치환해 보낸다. */
  sceneDescription: string;
  imageUrl: string | null;
  /** 대화 장면에서만. 등장인물 이름과 첫/끝 대사다. */
  characterName: string | null;
  characterOpening: string | null;
  characterClosing: string | null;
  /** 대화를 몇 번 주고받는지. narration 이면 null. */
  maxTurns: number | null;
  turn: number | null;
  /**
   * 미션 장면에서만 채워진다.
   * **단계 진입 시점에는 항상 null 이다** — 아이가 말한 뒤 `speak` 응답으로 온다.
   */
  mission: StepMission | null;
}

export interface StorySession {
  sessionId: string;
  storyId: string;
  status: 'in_progress' | 'completed';
  currentStep: number;
  sceneCount: number;
  step: SessionStep;
}

interface SessionStepDto {
  step_index: number;
  scene_count: number;
  kind: StepKind;
  scene_id: string;
  scene_description: string;
  image_url: string | null;
  character_name: string | null;
  character_opening: string | null;
  character_closing: string | null;
  max_turns: number | null;
  turn: number | null;
  mission: StepMission | null;
}

interface StorySessionDto {
  session_id: string;
  story_id: string;
  status: 'in_progress' | 'completed';
  current_step: number;
  scene_count: number;
  step: SessionStepDto;
}

function toStep(dto: SessionStepDto): SessionStep {
  return {
    stepIndex: dto.step_index,
    sceneCount: dto.scene_count,
    kind: dto.kind,
    sceneId: dto.scene_id,
    sceneDescription: dto.scene_description,
    imageUrl: dto.image_url === '' ? null : dto.image_url,
    characterName: dto.character_name,
    characterOpening: dto.character_opening,
    characterClosing: dto.character_closing,
    maxTurns: dto.max_turns,
    turn: dto.turn,
    mission: dto.mission,
  };
}

function toSession(dto: StorySessionDto): StorySession {
  return {
    sessionId: dto.session_id,
    storyId: dto.story_id,
    status: dto.status,
    currentStep: dto.current_step,
    sceneCount: dto.scene_count,
    step: toStep(dto.step),
  };
}

/**
 * `POST /progress/{story_id}/start?child_id=`
 *
 * 같은 이야기를 이미 진행 중이면 새 세션을 만들지 않고 **이어하기**가 된다.
 *
 * **아이당 `in_progress` 세션은 하나뿐이다.** 다른 이야기가 진행 중인 상태로
 * 부르면 409 가 온다 — 화면에서 "읽던 이야기를 마저 볼까요?" 로 안내해야지
 * 실패로 처리하면 안 된다. `ApiError.kind === 'conflict'` 로 갈린다.
 */
export async function startStorySession(storyId: string, childId: string): Promise<StorySession> {
  const dto = await request<StorySessionDto>({
    method: 'POST',
    url: `/progress/${storyId}/start`,
    params: { child_id: childId },
  });
  return toSession(dto);
}

/**
 * `GET /progress/active?child_id=` — 진행 중인 이야기. 없으면 null 이다.
 *
 * 홈의 "이어하기" 카드가 이 값으로 뜬다 (`GET /main` 의 `continue_story` 와
 * 겹치는데, 어느 쪽을 쓸지는 `/main` 이 구현된 뒤에 정하면 된다).
 */
export async function fetchActiveSession(childId: string): Promise<StorySession | null> {
  const dto = await request<StorySessionDto | null>({
    url: '/progress/active',
    params: { child_id: childId },
  });
  return dto === null ? null : toSession(dto);
}

/**
 * `POST /progress/{story_id}/steps/{step_index}?child_id=` — 단계 진입.
 *
 * 현재 단계 재진입, 또는 직전 단계를 끝낸 뒤의 다음 단계만 허용한다.
 * 건너뛰려 하면 409 "해당 단계로 이동할 수 없습니다" 다.
 *
 * **이 응답의 `mission` 은 항상 null 이고 `character_closing` 도 오지 않는다** —
 * 둘 다 대화가 진행돼야 나오는 값이라 `speak` 응답으로 온다.
 */
export async function enterStep(
  storyId: string,
  stepIndex: number,
  childId: string,
): Promise<SessionStep> {
  const dto = await request<SessionStepDto>({
    method: 'POST',
    url: `/progress/${storyId}/steps/${stepIndex}`,
    params: { child_id: childId },
  });
  return toStep(dto);
}

export interface StepProgress {
  currentStep: number;
  sceneCount: number;
  status: 'in_progress' | 'completed';
  /** 마지막 장면을 끝냈으면 true. 이야기 후 활동으로 넘어갈 신호다. */
  completed: boolean;
}

interface StepProgressDto {
  current_step: number;
  scene_count: number;
  status: 'in_progress' | 'completed';
  completed: boolean;
}

/**
 * `POST /progress/{story_id}/steps/{step_index}/complete?child_id=`
 *
 * **내레이션 장면 전용이다.** 대화 장면은 이미 끝난 경우에만 멱등 200 이고,
 * 아직 대화 중이면 409 "대화가 아직 끝나지 않았습니다" 다.
 */
export async function completeStep(
  storyId: string,
  stepIndex: number,
  childId: string,
): Promise<StepProgress> {
  const dto = await request<StepProgressDto>({
    method: 'POST',
    url: `/progress/${storyId}/steps/${stepIndex}/complete`,
    params: { child_id: childId },
  });

  return {
    currentStep: dto.current_step,
    sceneCount: dto.scene_count,
    status: dto.status,
    completed: dto.completed,
  };
}

export interface SpeakResult {
  accepted: boolean;
  /** STT 결과. 아이 말풍선에 들어간다. 서버 STT 가 아직 비어 있어 빈 문자열이 온다. */
  childText: string;
  /** 등장인물의 대답. `sceneEnded` 면 마무리 대사다. */
  characterLine: string | null;
  turn: number;
  maxTurns: number;
  mission: StepMission | null;
  /** true 면 이 장면이 끝났다 — 다음 단계로 진입한다. */
  sceneEnded: boolean;
  endReason: 'goal_met' | 'max_turns' | null;
}

interface SpeakResultDto {
  accepted: boolean;
  child_text: string;
  character_line: string | null;
  turn: number;
  max_turns: number;
  mission: StepMission | null;
  scene_ended: boolean;
  end_reason: 'goal_met' | 'max_turns' | null;
}

/**
 * `POST /progress/{story_id}/steps/{step_index}/speak?child_id=` — 아이 음성 업로드.
 *
 * **multipart/form-data 다.** `apiClient` 의 기본 헤더가 `application/json` 이라
 * 여기서 덮어써야 한다 — 안 그러면 서버가 본문을 읽지 못한다.
 *
 * 대화·미션 장면에서만 부른다. 내레이션에서 부르면 400 이다.
 *
 * **서버의 STT·대사 생성이 아직 비어 있다**(명세에 명시). 지금은 가드만 통과해
 * `child_text: ""`, `character_line: null`, `turn: 0` 이 돌아오고
 * **대화 장면이 끝나지 않는다.** 화면을 붙일 때 이걸 감안해야 한다.
 *
 * @param audio 녹음 파일. RN 에서는 `{ uri, name, type }` 모양을 그대로 넘긴다.
 */
export async function speak(
  storyId: string,
  stepIndex: number,
  childId: string,
  audio: { uri: string; name: string; type: string },
): Promise<SpeakResult> {
  const form = new FormData();
  // RN 의 FormData 는 이 모양의 객체를 파일로 취급한다 (웹의 File 이 없다).
  form.append('audio', audio as unknown as Blob);

  const dto = await request<SpeakResultDto>({
    method: 'POST',
    url: `/progress/${storyId}/steps/${stepIndex}/speak`,
    params: { child_id: childId },
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return {
    accepted: dto.accepted,
    childText: dto.child_text,
    characterLine: dto.character_line,
    turn: dto.turn,
    maxTurns: dto.max_turns,
    mission: dto.mission,
    sceneEnded: dto.scene_ended,
    endReason: dto.end_reason,
  };
}

export interface StoryProgressState {
  sessionId: string;
  status: 'in_progress' | 'completed';
  currentStep: number;
  sceneCount: number;
  currentKind: StepKind;
  /** 내레이션 장면이면 둘 다 null 이다. */
  turn: number | null;
  maxTurns: number | null;
}

interface StoryProgressStateDto {
  session_id: string;
  status: 'in_progress' | 'completed';
  current_step: number;
  scene_count: number;
  current_kind: StepKind;
  turn: number | null;
  max_turns: number | null;
}

/**
 * `GET /progress/{story_id}?child_id=` — 그 이야기의 최신 세션 상태.
 *
 * 이 이야기로 시작한 세션이 없으면 404 다(빈 응답이 아니다).
 * 앱을 껐다 켠 뒤 읽던 자리로 되돌아갈 때 쓴다.
 */
export async function fetchStoryProgress(
  storyId: string,
  childId: string,
): Promise<StoryProgressState> {
  const dto = await request<StoryProgressStateDto>({
    url: `/progress/${storyId}`,
    params: { child_id: childId },
  });

  return {
    sessionId: dto.session_id,
    status: dto.status,
    currentStep: dto.current_step,
    sceneCount: dto.scene_count,
    currentKind: dto.current_kind,
    turn: dto.turn,
    maxTurns: dto.max_turns,
  };
}
