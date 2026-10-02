
import type { CallState } from "../core/callState";

type CallDetailsProps = {
    call: CallState | null;
    detailsRef: React.RefObject<HTMLElement | null>;
};



export function CallDetails({ call, detailsRef }: CallDetailsProps) {
    if (!call) {
        return (
           <aside
    ref={detailsRef}
    className="call-details empty-details"
  tabIndex={0}
    aria-labelledby="call-details-heading"
>
    <h2 id="call-details-heading">Call details</h2>
    <p>Select a call to view its details.</p>
</aside>
        );
    }

    const isArabic = call.language === "ar";

    return (
        <aside className="call-details"
           tabIndex={0}
            ref={detailsRef}
            aria-labelledby="call-details-heading">
            <header>
                <h2 id="call-details-heading">Call details</h2>
                <p>{call.customerLabel}</p>
            </header>
            <div className="sr-only" aria-live="polite">
    Call for {call.customerLabel}. Agent {call.agentName}.
    Language {isArabic ? "Arabic" : "English"}.
    Direction {call.direction}.
    Current sentiment {call.sentiment.toFixed(2)}.
</div>
           <section aria-labelledby="call-information-heading">
    <h3 id="call-information-heading">Call information</h3>
                <dl className="call-info">
                    <div>
                        <dt>Agent</dt>
                        <dd>{call.agentName}</dd>
                    </div>
                    <div>
                        <dt>Language</dt>
                        <dd>{isArabic ? "Arabic" : "English"}</dd>
                    </div>
                    <div>
                        <dt>Direction</dt>
                        <dd>{call.direction}</dd>
                    </div>
                    <div>
                        <dt>Current sentiment</dt>
                        <dd>{call.sentiment.toFixed(2)}</dd>
                    </div>
                </dl>
            </section>

           <section aria-labelledby="transcript-heading">
    <h3 id="transcript-heading">Transcript</h3>
                <div
                    className="transcript"
                    dir={isArabic ? "rtl" : "ltr"}
                    lang={isArabic ? "ar" : "en"}
                    aria-label={isArabic ? "نص المكالمة" : "Call transcript"}
                >
                    {call.transcript.map((line, index) => (
                        <div className="transcript-line" key={`${line.at}-${index}`}>
                            <strong>
                                {line.speaker === "agent" ? "Agent" : "Customer"}
                            </strong>
                            <p>{line.text}</p>
                        </div>
                    ))}

                    {Object.entries(call.partials).map(([speaker, text]) =>
                        text ? (
                            <div className="transcript-line partial" key={speaker}>
                                <strong>
                                    {speaker === "agent" ? "Agent" : "Customer"} (speaking)
                                </strong>
                                <p>{text}</p>
                            </div>
                        ) : null
                    )}

                    {call.transcript.length === 0 &&
                        Object.keys(call.partials).length === 0 && (
                            <p className="muted">Waiting for transcript...</p>
                        )}
                </div>
            </section>

            <section aria-labelledby="sentiment-history-heading">
    <h3 id="sentiment-history-heading">Sentiment history</h3>
                {call.sentimentHistory.length === 0 ? (
                    <p className="muted">No sentiment updates yet.</p>
                ) : (
                    <ol className="history-list">
                        {call.sentimentHistory.slice(-8).map((item, index) => (
                            <li key={`${item.at}-${index}`}>
                                <span>{item.score.toFixed(2)}</span>
                                <time>{new Date(item.at).toLocaleTimeString()}</time>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            <section aria-labelledby="tool-activity-heading">
    <h3 id="tool-activity-heading">Tool activity</h3>
                {call.tools.length === 0 ? (
                    <p className="muted">No tool activity yet.</p>
                ) : (
                    <ul className="tool-list">
                        {call.tools.slice(-8).map((tool, index) => (
                            <li key={`${tool.at}-${index}`}>
                                <span>{tool.tool}</span>
                                <span className={`tool-status ${tool.status}`}>
                                    {tool.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {call.handoffReason && (
                <section className="handoff-notice">
                    <h3>Handoff requested</h3>
                    <p>{call.handoffReason}</p>
                </section>
            )}
        </aside>
    );
}