
import type { CallEvent, Lang, Speaker } from "../core/types";

type SimulatorOptions = {
  callCount?: number;
  eventsPerSecond?: number;
};

type EventPayload<T = CallEvent> =
  T extends CallEvent
    ? Omit<T, "callId" | "seq" | "at">
    : never;

const arabicLines = [
  "أبغى أغير الباقة إلى Plus G5 لو سمحت",
  "رقم الطلب ORD-4471 ما وصلني للحين",
  "ممكن تساعدني في الفاتورة؟",
  "أبي أكلم موظف خدمة العملاء",
];

const englishLines = [
  "I need help with my account",
  "Can I pay the bill in installments?",
  "I haven't received my order",
  "Thank you for your help",
];

const mixedLines = [
  "Can I pay the bill بالتقسيط?",
  "أبغى upgrade to Plus G5",
  "I need help بخصوص الفاتورة",
];

const tools = ["check_balance", "verify_identity", "update_plan"];

const random = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

export class CallSimulator {
  private calls = new Map<string, {
    seq: number;
    language: Lang;
    direction: "inbound" | "outbound";
    customerLabel: string;
  }>();

  private timer?: ReturnType<typeof setInterval>;
  private eventsPerSecond: number;
  private chaos = false;
  private connected = true;
  private replayQueue: CallEvent[] = [];
  private reorderQueue: CallEvent[] = [];
  
  private activePartials = new Map<
  string,
  {
    speaker: Speaker;
    words: string[];
    index: number;
  }
>();

  constructor(options: SimulatorOptions = {}) {
    this.eventsPerSecond = options.eventsPerSecond ?? 30;

    const count = options.callCount ?? 120;

    for (let i = 1; i <= count; i++) {
      const id = `call-${i}`;
      const language = random<Lang>(["ar", "en"]);
      const direction = random<"inbound" | "outbound">([
        "inbound",
        "outbound",
      ]);

      this.calls.set(id, {
        seq: 0,
        language,
        direction,
        customerLabel: `Customer ${i}`,
      });
    }
  }

  private createEvent(
    callId: string,
    event: EventPayload
  ): CallEvent {
    const call = this.calls.get(callId)!;

    return {
      ...event,
      callId,
      seq: ++call.seq,
      at: Date.now(),
    } as CallEvent;
  }

  private emit(event: CallEvent, onEvent: (event: CallEvent) => void) {
    if (!this.connected) {
      this.replayQueue.push(event);
      return;
    }

    if (this.chaos && Math.random() < 0.12) {
      onEvent(event);
      onEvent(event);
      return;
    }

    if (this.chaos && Math.random() < 0.2) {
      this.reorderQueue.push(event);

      if (this.reorderQueue.length >= 3) {
        onEvent(this.reorderQueue.pop()!);
        onEvent(this.reorderQueue.shift()!);
      }
      return;
    }

    onEvent(event);
  }

  private generateEvent(callId: string): CallEvent {
  const call = this.calls.get(callId)!;

  // Continue an existing partial transcript.
  const activePartial = this.activePartials.get(callId);

  if (activePartial) {
    activePartial.index++;

    // Commit the partial as final when all words have been revealed.
    if (activePartial.index >= activePartial.words.length) {
      this.activePartials.delete(callId);

      return this.createEvent(callId, {
        type: "transcript.final",
        speaker: activePartial.speaker,
        text: activePartial.words.join(" "),
      });
    }

    return this.createEvent(callId, {
      type: "transcript.partial",
      speaker: activePartial.speaker,
      text: activePartial.words
        .slice(0, activePartial.index)
        .join(" "),
    });
  }

  const roll = Math.random();

  if (roll < 0.45) {
    const lines =
      call.language === "ar"
        ? arabicLines
        : [...englishLines, ...mixedLines];

   const speaker = random<Speaker>(["agent", "customer"]);
    const text = random(lines);

    return this.createEvent(callId, {
      type: "transcript.final",
      speaker,
      text,
    });
  }

  if (roll < 0.65) {
    return this.createEvent(callId, {
      type: "sentiment",
      score: Number((Math.random() * 2 - 1).toFixed(2)),
    });
  }

  if (roll < 0.85) {
    return this.createEvent(callId, {
      type: "tool.called",
      tool: random(tools),
      status: random(["pending", "ok", "error"] as const),
    });
  }

  if (roll < 0.92) {
    return this.createEvent(callId, {
      type: "handoff.requested",
      reason: "Customer requested human assistance",
    });
  }

const speaker = random<Speaker>(["agent", "customer"]);
  const lines =
    call.language === "ar"
      ? arabicLines
      : [...englishLines, ...mixedLines];

  const text = random(lines);

  this.activePartials.set(callId, {
    speaker,
    words: text.split(" "),
    index: 1,
  });

  return this.createEvent(callId, {
    type: "transcript.partial",
    speaker,
    text: text.split(" ")[0],
  });
}

  start(onEvent: (event: CallEvent) => void) {
    if (this.timer) return;

    // Emit initial call.started events.
    for (const [callId, call] of this.calls) {
      this.emit(
        this.createEvent(callId, {
          type: "call.started",
          direction: call.direction,
          language: call.language,
          agentName: `Agent ${callId.split("-")[1]}`,
          customerLabel: call.customerLabel,
        }),
        onEvent
      );
    }

    const interval = 1000 / this.eventsPerSecond;

    this.timer = setInterval(() => {
      const callId = random(Array.from(this.calls.keys()));
      const event = this.generateEvent(callId);
      this.emit(event, onEvent);
    }, interval);
  }

  setChaos(enabled: boolean) {
    this.chaos = enabled;
  }

  disconnect() {
    this.connected = false;
  }

  reconnect(onEvent: (event: CallEvent) => void) {
    this.connected = true;

    // Replay events in original generation order.
    const queued = this.replayQueue;
    this.replayQueue = [];

    queued.forEach((event) => onEvent(event));

    // Flush any remaining reordered events.
    this.reorderQueue.forEach((event) => onEvent(event));
    this.reorderQueue = [];
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}