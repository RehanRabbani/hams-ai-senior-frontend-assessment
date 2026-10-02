
import type { CallEvent } from "./types";
import type { CallState } from "./callState";

type ReconcileResult = {
  applied: number;
  ignored: number;
  buffered: number;
};

export class EventReconciler {
  private calls = new Map<string, CallState>();
  private buffers = new Map<string, Map<number, CallEvent>>();

  accept(event: CallEvent): ReconcileResult {
    const callId = event.callId;
    let buffer = this.buffers.get(callId);

    if (!buffer) {
      buffer = new Map();
      this.buffers.set(callId, buffer);
    }

    const state = this.calls.get(callId);
    const nextSeq = state?.nextSeq ?? 1;

    // Ignore events already applied or already buffered.
    if (event.seq < nextSeq || buffer.has(event.seq)) {
      return { applied: 0, ignored: 1, buffered: 0 };
    }

    buffer.set(event.seq, event);

    let applied = 0;

    while (buffer.has(this.calls.get(callId)?.nextSeq ?? 1)) {
      const expected = this.calls.get(callId)?.nextSeq ?? 1;
      const nextEvent = buffer.get(expected)!;

      buffer.delete(expected);
      this.apply(nextEvent);
      applied++;
    }

    return {
      applied,
      ignored: 0,
      buffered: applied === 0 ? 1 : 0,
    };
  }

  private apply(event: CallEvent) {
    const current = this.calls.get(event.callId);

    if (event.type === "call.started") {
      if (current) {
        current.nextSeq = event.seq + 1;
        return;
      }

      this.calls.set(event.callId, {
        callId: event.callId,
        nextSeq: event.seq + 1,
        direction: event.direction,
        language: event.language,
        agentName: event.agentName,
        customerLabel: event.customerLabel,
        transcript: [],
        partials: {},
        sentiment: 0,
        sentimentHistory: [],
        tools: [],
        handoffReason: null,
        outcome: null,
      });

      return;
    }

    if (!current) return;

    switch (event.type) {
      case "transcript.partial":
        current.partials[event.speaker] = event.text;
        break;

      case "transcript.final":
        current.transcript.push({
          speaker: event.speaker,
          text: event.text,
          at: event.at,
        });
        delete current.partials[event.speaker];
        break;

      case "sentiment":
        current.sentiment = event.score;
        current.sentimentHistory.push({
          score: event.score,
          at: event.at,
        });
        break;

      case "tool.called":
        current.tools.push({
          tool: event.tool,
          status: event.status,
          at: event.at,
        });
        break;

      case "handoff.requested":
        current.handoffReason = event.reason;
        break;

      case "call.ended":
        current.outcome = event.outcome;
        break;
    }

    current.nextSeq = event.seq + 1;
  }

  getCall(callId: string) {
    return this.calls.get(callId);
  }

  getAllCalls() {
    return Array.from(this.calls.values());
  }
}