
import type { CallState } from "./callState";

export type AttentionLevel = "urgent" | "review" | "normal";

export function getAttention(call: CallState): {
  level: AttentionLevel;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (call.handoffReason) {
    reasons.push("Handoff requested");
  }

  if (call.tools.some((tool) => tool.status === "error")) {
    reasons.push("Tool error");
  }

  if (call.sentiment < -0.4) {
    reasons.push("Strong negative sentiment");
  } else if (call.sentiment < 0) {
    reasons.push("Negative sentiment");
  }

  if (call.outcome !== null) {
    return { level: "normal", reasons: [] };
  }

  if (call.handoffReason || call.tools.some((tool) => tool.status === "error")) {
    return { level: "urgent", reasons };
  }

  if (call.sentiment < 0) {
    return { level: "review", reasons };
  }

  return { level: "normal", reasons };
}

const priorityOrder: Record<AttentionLevel, number> = {
  urgent: 0,
  review: 1,
  normal: 2,
};

export function prioritizeCalls(calls: CallState[]): CallState[] {
  return [...calls].sort((a, b) => {
    const priorityDifference =
      priorityOrder[getAttention(a).level] -
      priorityOrder[getAttention(b).level];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return b.nextSeq - a.nextSeq;
  });
}