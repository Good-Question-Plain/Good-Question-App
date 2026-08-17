import type { StoryReport, ReportTrait } from '../api/reportApi';

import type { LearningReport } from './types';

/**
 * 서버 리포트를 화면이 쓰는 모양으로 옮긴다.
 *
 * 화면 컴포넌트(어휘·표현·논리 패널)는 디자인에 맞춰 이미 짜여 있어서,
 * 그쪽을 서버 모양으로 뜯어고치는 대신 여기서 한 번 변환한다.
 * **서버 응답이 바뀌면 이 파일만 보면 된다.**
 *
 * 이름이 다른 것들:
 *
 * | 화면            | 서버                              |
 * | --------------- | --------------------------------- |
 * | `trait`         | `vocabulary.speech_summary`       |
 * | `vocabulary.used`  | `vocabulary.used_words`        |
 * | `vocabulary.asked` | `vocabulary.curious_words`     |
 * | `vocabulary.phrases` | `vocabulary.expression_patterns` |
 * | `skill.title`   | `label`                           |
 * | `skill.summary` | `description`                     |
 * | `skill.notes`   | `strength` + `tip` (둘 중 하나만 올 수 있다) |
 * | `highlight`     | `representative`                  |
 * | `storyTopics`   | `home_conversation.story_topics`  |
 * | `dailyTopics`   | `home_conversation.daily_life`    |
 *
 * **`phraseNote` 는 서버에 대응 필드가 없어 비워 둔다** (화면이 알아서 뺀다).
 */
export function toLearningReport(report: StoryReport, completedAt: string): LearningReport {
  return {
    id: report.reportId,
    storyId: report.storyId,
    storyTitle: report.storyTitle,
    completedAt,
    // 위쪽 주황 카드에 들어가는 한 줄 요약. 서버는 어휘 블록 안에 넣어 보낸다.
    trait: report.vocabulary?.speechSummary ?? '',
    vocabulary: {
      used: report.vocabulary?.usedWords ?? [],
      asked: report.vocabulary?.curiousWords ?? [],
      phrases: report.vocabulary?.expressionPatterns ?? [],
      feedback: report.vocabulary?.feedback ?? '',
    },
    expression: report.expression.map(toSkill),
    logic: report.logic.map(toSkill),
    highlight: {
      quote: report.representative?.text ?? '',
      reason: report.representative?.reason ?? '',
    },
    storyTopics:
      report.homeConversation?.storyTopics.map((topic) => ({
        question: topic.question,
        practice: topic.practiceLabel,
      })) ?? [],
    dailyTopics:
      report.homeConversation?.dailyLife.map((topic) => ({
        question: topic.question,
        practice: topic.practiceLabel,
      })) ?? [],
  };
}

/**
 * 표현·논리 항목 하나.
 *
 * `strength` 와 `tip` 은 **둘 중 하나만 오는 게 정상이다** — 잘한 항목은
 * `strength` 가, 아쉬운 항목은 `tip` 이 채워진다. 둘 다 없으면 빈 배열이 되고
 * 화면은 그 줄을 그리지 않는다.
 */
function toSkill(trait: ReportTrait): LearningReport['expression'][number] {
  const notes = [trait.strength, trait.tip].filter(
    (note): note is string => note !== null && note.length > 0,
  );

  return {
    title: trait.label,
    summary: trait.description,
    quotes: trait.quotes,
    notes,
  };
}
