
import { useCallback, useEffect, useRef, useState } from "react";
import { EventReconciler } from "../core/eventReconciler";
import { CallSimulator } from "../simulator/simulator";
import type { CallEvent } from "../core/types";
import type { CallState } from "../core/callState";
import { getImportantAnnouncement } from "../core/accessibility";

export function useLiveCalls() {
    const [calls, setCalls] = useState<CallState[]>([]);
    const [connected, setConnected] = useState(true);
    const [chaosEnabled, setChaosEnabled] = useState(false);

    const simulatorRef = useRef<CallSimulator | null>(null);
    const handleEventRef = useRef<(event: CallEvent) => void>(() => { });
    const dirtyRef = useRef(false);
    const previousCallsRef = useRef(new Map<string, CallState>());
    const [announcement, setAnnouncement] = useState("");

    useEffect(() => {
        const reconciler = new EventReconciler();
        const simulator = new CallSimulator();

        simulatorRef.current = simulator;

        const handleEvent = (event: CallEvent) => {
            reconciler.accept(event);

            const currentCall = reconciler.getCall(event.callId);

            if (currentCall) {
                const previousCall = previousCallsRef.current.get(event.callId);

                const importantAnnouncement = getImportantAnnouncement(
                    previousCall,
                    currentCall
                );

                if (importantAnnouncement) {
                    setAnnouncement(importantAnnouncement);
                }

                previousCallsRef.current.set(event.callId, {
                    ...currentCall,
                    transcript: [...currentCall.transcript],
                    partials: { ...currentCall.partials },
                    sentimentHistory: [...currentCall.sentimentHistory],
                    tools: [...currentCall.tools],
                });
            }

            dirtyRef.current = true;
        };

        handleEventRef.current = handleEvent;

        const updateInterval = window.setInterval(() => {
            if (dirtyRef.current) {
                setCalls([...reconciler.getAllCalls()]);
                dirtyRef.current = false;
            }
        }, 100);

        simulator.start(handleEvent);

        return () => {
            window.clearInterval(updateInterval);
            simulator.stop();
            simulatorRef.current = null;
        };
    }, []);

    const toggleChaos = useCallback((enabled: boolean) => {
        simulatorRef.current?.setChaos(enabled);
        setChaosEnabled(enabled);
    }, []);

    const disconnect = useCallback(() => {
        simulatorRef.current?.disconnect();
        setConnected(false);
    }, []);

    const reconnect = useCallback(() => {
        simulatorRef.current?.reconnect(handleEventRef.current);
        setConnected(true);
    }, []);

    return {
        calls,
        connected,
        chaosEnabled,
        announcement,
        toggleChaos,
        disconnect,
        reconnect,
    };
}