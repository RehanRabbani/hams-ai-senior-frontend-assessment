import type { Lang, Speaker } from "./types";

export type TranscriptLine = {
  speaker: Speaker;
  text: string;
  at: number;
};

export type ToolActivity = {
  tool: string;
  status: "pending" | "ok" | "error";
  at: number;
};

export type CallState = {
  callId: string;
  nextSeq: number;
  direction: "inbound" | "outbound";
  language: Lang;
  agentName: string;
  customerLabel: string;
  transcript: TranscriptLine[];
  partials: Partial<Record<Speaker, string>>;
  sentiment: number;
  sentimentHistory: { score: number; at: number }[];
  tools: ToolActivity[];
  handoffReason: string | null;
  outcome: "resolved" | "transferred" | "abandoned" | null;
};