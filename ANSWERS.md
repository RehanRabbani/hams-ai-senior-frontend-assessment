
## PART 2
## 2.1 — Review this pull request

### 1. Review comments

🔴 **Blocking — We can lose transcript messages**

`setLines([...lines, event])` is using the `lines` value from when the effect started. If messages come in quickly, we can overwrite previous messages. Can we use the functional state update here?

🔴 **Blocking — We need to use `seq`**

We currently just append every event. Since messages can arrive out of order or be sent more than once, we should use `seq` to identify each line, update an existing line when the same `seq` comes again, and keep the final list sorted.

🔴 **Blocking — `final` is not handled**

The `final` block is currently empty. If an interim event is followed by the final version with the same `seq`, we should update that existing line instead of adding a new one.

🔴 **Blocking — Reconnect needs to use the same handlers**

On close, we create a new WebSocket, but the new socket doesn't get the `onmessage`, `onopen`, and `onclose` handlers. Also, we should clear the reconnect timer and close the socket when the hook is unmounted.

🟡 **`url` should be in the dependency array**

The effect uses `url`, so I think we should include it in the dependencies to avoid keeping an old URL if it changes.

### 2. Version I'd be happy to merge

```tsx
import { useEffect, useState } from 'react'

type TranscriptEvent = {
  callId: string
  seq: number
  final: boolean
  speaker: 'agent' | 'customer'
  text: string
}

export function useCallTranscript(callId: string, url: string) {
  const [lines, setLines] = useState<TranscriptEvent[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let ws: WebSocket | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    let stopped = false

    const connect = () => {
      if (stopped) return

      ws = new WebSocket(`${url}?call=${callId}`)

      ws.onopen = () => setIsLive(true)

      ws.onmessage = (msg) => {
        try {
          const event: TranscriptEvent = JSON.parse(msg.data)

          setLines((current) => {
            const index = current.findIndex(
              (line) => line.seq === event.seq
            )

            if (index === -1) {
              return [...current, event].sort(
                (a, b) => a.seq - b.seq
              )
            }

            const updated = [...current]
            updated[index] = event
            return updated
          })
        } catch {
          // Ignore invalid messages
        }
      }

      ws.onclose = () => {
        setIsLive(false)

        if (!stopped) {
          timer = setTimeout(connect, 1000)
        }
      }
    }

    setLines([])
    connect()

    return () => {
      stopped = true

      if (timer) clearTimeout(timer)
      ws?.close()
    }
  }, [callId, url])

  return { lines, isLive }
}
```

### 3. AI

I would encourage the teammate to use AI for the first draft, but also ask it to review the code against specific edge cases before opening the PR. For realtime code, I would ask AI to check scenarios like duplicate messages, out-of-order events, reconnects, and stale React state, and then verify those cases with real tests instead of only checking that it works locally.


## 2.2 — To split, or not to split

I would not introduce Module Federation just because we have a large React application and multiple squads. I would first understand what problem we are trying to solve.

I have used Module Federation in production, and it worked well when different teams owned different parts of a large application and needed to release their work independently. But it also adds complexity around shared dependencies, communication between MFEs, deployments, and debugging.

Before deciding, I would check if teams are actually blocking each other, if deployments are becoming difficult, if build times are slowing us down, and if there are clear boundaries between different parts of the application.

If these problems are real, I would start with one small MFE instead of splitting the whole application. I would measure whether it actually improves team independence and releases before doing more.

If the real problem is something simpler, like slow builds or unclear ownership, I would fix that first instead of adding Module Federation.


## 2.3 — What the score didn't see

An accessibility score doesn't tell us everything. Automated tools can find missing labels or low colour contrast, but they can't catch every issue.

I would manually check keyboard navigation, focus order, screen reader support, form errors and modal behaviour.

To make accessibility part of our daily work, I'd include these checks in code reviews and use accessible components wherever possible. This way, accessibility becomes part of our normal development process rather than an extra task at the end.

## PART 3
## 3.1 — Call Pulse: Rough UI Sketch
## PART 3

### 3.1 — Call Pulse: Rough UI Sketch

```text
┌─────────────────────────────────────────────┐
│                  CALL PULSE                 │
│                                             │
│  Call #1042                 ⚠ Check this call│
│  ● Live                                     │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Speaking balance                           │
│                                             │
│  Agent     ██████████████░░░░░  70%         │
│  Customer  ██████░░░░░░░░░░░░░  30%         │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  ◷ Silence / inactivity                     │
│                                             │
│  Last activity: 12 seconds ago              │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Attention indicator                        │
│                                             │
│  Agent is speaking more than customer.      │
│  Long pause detected.                       │
│                                             │
│  These are signals, not a call quality score│
└─────────────────────────────────────────────┘
```

### How it works

* **Speaking balance:** Shows how much the agent and customer are talking.
* **Silence:** Shows how long no one has spoken.
* **Attention indicator:** Highlights calls that may need the supervisor's attention.

### What it leaves out

It doesn't show the transcript or try to guess the customer's feelings. It also doesn't judge whether a call is good or bad.

### Accessibility and Arabic RTL

* Use text and icons along with colours so everyone can understand the information.
* Make sure the text is easy to read and the UI works with a keyboard.
* Support right-to-left layout for Arabic and keep numbers easy to read.

### How it could mislead

If the agent talks more than the customer, it doesn't always mean something is wrong. The agent might just be explaining something. So, I would show a label like "Unbalanced speaking" instead of saying the call is bad.

## 3.2 — Your corner of the web

Recently, while working on a client project, I noticed something in our frontend code that I found interesting.

We had three similar product features, and each one had its own container. They were all working fine in production, but I noticed that we were using many of the same utilities, mixins, and composables in all three places.

I thought we could clean this up by moving the common logic into shared utilities or composables instead of having similar code in different places.

This was not a bug or something that was causing an issue. I just noticed the repeated code and thought we could make it easier to maintain and reuse.

I discussed the idea with my lead, and he also liked the idea. We are planning to look into it after the peak period.

I like these kinds of things because I enjoy looking at working code and thinking about how we can make it simpler and easier to maintain.
::
