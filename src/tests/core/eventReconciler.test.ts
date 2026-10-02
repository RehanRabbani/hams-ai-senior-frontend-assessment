import { describe, expect, it } from "vitest";
import { EventReconciler } from "../../core/eventReconciler";
import type { CallEvent } from "../../core/types";

const callStarted: CallEvent = {
	callId: "call-1",
	seq: 1,
	at: 100,
	type: "call.started",
	direction: "inbound",
	language: "en",
	agentName: "Agent",
	customerLabel: "Customer",
};

describe("EventReconciler", () => {
	it("buffers out-of-order events and applies them once the gap is filled", () => {
		const reconciler = new EventReconciler();
		const transcriptEvent: CallEvent = {
			callId: "call-1",
			seq: 2,
			at: 200,
			type: "transcript.final",
			speaker: "customer",
			text: "Hello",
		};

		expect(reconciler.accept(transcriptEvent)).toEqual({
			applied: 0,
			ignored: 0,
			buffered: 1,
		});
		expect(reconciler.getCall("call-1")).toBeUndefined();

		expect(reconciler.accept(callStarted)).toEqual({
			applied: 2,
			ignored: 0,
			buffered: 0,
		});
		expect(reconciler.getCall("call-1")?.transcript).toEqual([
			{ speaker: "customer", text: "Hello", at: 200 },
		]);
	});

	it("ignores events that have already been applied", () => {
		const reconciler = new EventReconciler();

		reconciler.accept(callStarted);

		expect(reconciler.accept(callStarted)).toEqual({
			applied: 0,
			ignored: 1,
			buffered: 0,
		});
	});
    it("ignores duplicate events after reconnect and continues applying new events", () => {
	const reconciler = new EventReconciler();

	reconciler.accept(callStarted);

	const firstFinal: CallEvent = {
		callId: "call-1",
		seq: 2,
		at: 200,
		type: "transcript.final",
		speaker: "customer",
		text: "Hello",
	};

	const secondFinal: CallEvent = {
		callId: "call-1",
		seq: 3,
		at: 300,
		type: "transcript.final",
		speaker: "agent",
		text: "Hi, how can I help?",
	};

	reconciler.accept(firstFinal);

	// Simulate reconnect: previously received events arrive again.
	expect(reconciler.accept(callStarted)).toEqual({
		applied: 0,
		ignored: 1,
		buffered: 0,
	});

	expect(reconciler.accept(firstFinal)).toEqual({
		applied: 0,
		ignored: 1,
		buffered: 0,
	});

	// New event after reconnect should still be applied.
	expect(reconciler.accept(secondFinal)).toEqual({
		applied: 1,
		ignored: 0,
		buffered: 0,
	});

	expect(reconciler.getCall("call-1")?.transcript).toEqual([
		{ speaker: "customer", text: "Hello", at: 200 },
		{ speaker: "agent", text: "Hi, how can I help?", at: 300 },
	]);
});
});
