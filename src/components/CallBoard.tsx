
import type { CallState } from "../core/callState";
import { getAttention, prioritizeCalls } from "../core/attention";

type CallBoardProps = {
    calls: CallState[];
    selectedCallId: string | null;
    connected: boolean;
    chaosEnabled: boolean;
    onSelect: (callId: string) => void;
    onToggleChaos: (enabled: boolean) => void;
    onDisconnect: () => void;
    onReconnect: () => void;
};

export function CallBoard({
    calls,
    selectedCallId,
    connected,
    chaosEnabled,
    onSelect,
    onToggleChaos,
    onDisconnect,
    onReconnect,
}: CallBoardProps) {
    const prioritizedCalls = prioritizeCalls(calls);

    const attentionCount = calls.filter(
        (call) => getAttention(call).level !== "normal"
    ).length;

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Live Supervisor Board</h1>
                    <p>Monitor active AI-assisted calls</p>
                </div>

                <div className="controls">
                    <span className={connected ? "status connected" : "status disconnected"}>
                        {connected ? "Connected" : "Disconnected"}
                    </span>

                    {connected ? (
                        <button onClick={onDisconnect}>Disconnect</button>
                    ) : (
                        <button onClick={onReconnect}>Reconnect</button>
                    )}

                    <label>
                        <input
                            type="checkbox"
                            checked={chaosEnabled}
                            onChange={(event) => onToggleChaos(event.target.checked)}
                        />
                        Chaos mode
                    </label>
                </div>
            </header>

            <section className="summary">
                <div>
                    <span>Active calls</span>
                    <strong>{calls.length}</strong>
                </div>
                <div>
                    <span>Needs attention</span>
                    <strong>{attentionCount}</strong>
                </div>
            </section>

            <section className="call-list">
                <h2>Calls</h2>

                <div className="call-table">
                    <div className="call-row call-row-header">
                        <span>Customer</span>
                        <span>Agent</span>
                        <span>Language</span>
                        <span>Sentiment</span>
                        <span>Status</span>
                    </div>

                    {prioritizedCalls.map((call) => {
                        const attention = getAttention(call);

                        return (
                            <button
                                key={call.callId}
                                className={`call-row ${selectedCallId === call.callId ? "selected" : ""
                                    }`}
                                onClick={() => onSelect(call.callId)}
                            >
                                <span>{call.customerLabel}</span>
                                <span>{call.agentName}</span>
                                <span>{call.language.toUpperCase()}</span>
                                <span>{call.sentiment.toFixed(2)}</span>
                                <span className={`attention-${attention.level}`} title={attention.reasons.join(", ") || "No attention required"}>
                                    {attention.level === "urgent"
                                        ? "Urgent"
                                        : attention.level === "review"
                                            ? "Review"
                                            : "Normal"}
                                    </span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}