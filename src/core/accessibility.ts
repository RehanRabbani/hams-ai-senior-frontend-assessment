import type { CallState } from "./callState";
import { getAttention } from "./attention";

export function getImportantAnnouncement(
    previousCall: CallState | undefined,
    currentCall: CallState
): string | null {
    const previousAttention = previousCall
        ? getAttention(previousCall)
        : null;

    const currentAttention = getAttention(currentCall);

    if (
        currentCall.handoffReason &&
        previousCall?.handoffReason !== currentCall.handoffReason
    ) {
        return `Handoff requested for ${currentCall.customerLabel}. ${currentCall.handoffReason}`;
    }

    if (
        currentAttention.level !== "normal" &&
        previousAttention?.level !== currentAttention.level
    ) {
        const level =
            currentAttention.level === "urgent" ? "Urgent" : "Needs review";

        return `${level}: ${currentCall.customerLabel}. ${currentAttention.reasons.join(
            ", "
        )}`;
    }

    return null;
}