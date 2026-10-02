import { useEffect, useState } from 'react'
type TranscriptEvent = {
    callId: string; seq: number; final: boolean
    speaker: 'agent' | 'customer'; text: string
}
export function useCallTranscript(callId: string, url: string) {
    const [lines, setLines] = useState<TranscriptEvent[]>([])
    const [isLive, setIsLive] = useState(false)
    useEffect(() => {
        const ws = new WebSocket(`${url}?call=${callId}`)
        ws.onopen = () => setIsLive(true)
        ws.onmessage = (msg) => {
            const event: TranscriptEvent = JSON.parse(msg.data)
            if (event.final) {
                setLines([...lines, event])
            }
        }
        ws.onclose = () => {
            setIsLive(false)
            setTimeout(() => {
                new WebSocket(`${url}?call=${callId}`)
            }, 1000)
        }
    }, [callId])
    return { lines, isLive }
}