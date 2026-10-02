export type Lang = "ar" | "en";

export type Speaker = "agent" | "customer";

export type CallEvent = {
  callId: string;
  seq: number;
  at: number;
} & (
  | {
      type: "call.started";
      direction: "inbound" | "outbound";
      language: Lang;
      agentName: string;
      customerLabel: string;
    }
  | {
      type: "transcript.partial";
      speaker: Speaker;
      text: string;
    }
  | {
      type: "transcript.final";
      speaker: Speaker;
      text: string;
    }
  | {
      type: "sentiment";
      score: number;
    }
  | {
      type: "tool.called";
      tool: string;
      status: "pending" | "ok" | "error";
    }
  | {
      type: "handoff.requested";
      reason: string;
    }
  | {
      type: "call.ended";
      outcome: "resolved" | "transferred" | "abandoned";
    }
);