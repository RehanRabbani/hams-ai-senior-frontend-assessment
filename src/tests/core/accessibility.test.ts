import { describe, expect, it } from "vitest";
import { getImportantAnnouncement } from "../../core/accessibility";
import type { CallState } from "../../core/callState";

const baseCall: CallState = {
    callId: "call-1",
    nextSeq: 2,
    direction: "inbound",
    language: "en",
    agentName: "Agent 1",
    customerLabel: "Customer 1",
    transcript: [],
    partials: {},
    sentiment: 0,
    sentimentHistory: [],
    tools: [],
    handoffReason: null,
    outcome: null,
};

describe("getImportantAnnouncement", () => {
    it("announces a new handoff request", () => {
        const current = {
            ...baseCall,
            handoffReason: "Customer requested human assistance",
        };

        expect(getImportantAnnouncement(baseCall, current)).toBe(
            "Handoff requested for Customer 1. Customer requested human assistance"
        );
    });

    it("does not announce normal updates", () => {
        const current = {
            ...baseCall,
            sentiment: 0.2,
        };

        expect(getImportantAnnouncement(baseCall, current)).toBeNull();
    });
});