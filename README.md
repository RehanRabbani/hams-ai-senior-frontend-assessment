Yes. I’d add a short section after **“What I implemented”**. Keep it simple enough that you can explain every part during the walkthrough.

# Hams.AI Senior Frontend Assessment

This is a small supervisor dashboard for monitoring live AI-assisted calls.

The app uses a simulator to generate call events and shows the calls on a supervisor board. A supervisor can select a call to see its live transcript, sentiment updates, tool activity, and handoff requests.

The main focus of the implementation was handling the event stream correctly when events are duplicated, arrive out of order, or are replayed after reconnecting.

## Running the project

Install dependencies:

```bash id="b4ljvm"
npm install
```

Start the app:

```bash id="a99vrn"
npm run dev
```

Open the local URL shown by Vite in the terminal.

Run the tests:

```bash id="snckms"
npm test
```

The tests cover the event reconciliation logic, including duplicate and out-of-order events.

## Architecture overview

The app is split into a few simple layers:

```text
Simulator
   ↓
useLiveCalls
   ↓
EventReconciler
   ↓
CallState
   ↓
React UI
   ├── CallBoard
   └── CallDetails
```

### Simulator

`src/simulator/simulator.ts`

Generates live call events such as transcript updates, sentiment changes, tool calls, and handoff requests.

It can also simulate duplicate events, out-of-order events, and disconnect/reconnect scenarios through Chaos Mode.

### Live calls hook

`src/hooks/useLiveCalls.ts`

Connects the simulator to the application.

It receives events, passes them to the reconciler, and periodically updates the React state used by the UI.

### Event reconciler

`src/core/eventReconciler.ts`

This is where the event ordering and duplicate handling happens.

It keeps track of the next expected sequence number for each call and temporarily buffers events when they arrive out of order.

This part does not depend on React, which makes the important event-handling behavior easier to test.

### Call state

`src/core/callState.ts`

Defines the state maintained for each call, including transcript entries, partial transcripts, sentiment, tools, and handoff information.

### UI

`src/components/CallBoard.tsx`

Displays all active calls and their attention status.

`src/components/CallDetails.tsx`

Displays the selected call and its live information.

The UI is intentionally fairly small. Most of the complexity is kept in the event reconciliation layer rather than in the components.

## What I implemented

### Supervisor board

The board shows the active calls and gives a quick view of:

* Customer
* Agent
* Language
* Sentiment
* Attention status

Calls that need attention are moved higher in the list.

### Call details

Selecting a call shows:

* Call information
* Live transcript
* Sentiment history
* Tool activity
* Handoff request

For transcripts, partial messages are updated in place and final messages are added to the committed transcript.

### Handling duplicate and out-of-order events

This was one of the main areas I focused on.

The event handling is in:

`src/core/eventReconciler.ts`

Each event has a `callId` and sequence number.

If an event arrives before the previous sequence number, it is temporarily buffered. Once the missing event arrives, the buffered events can be applied in order.

If the same event is received again, it is ignored.

This keeps the UI from showing duplicate transcript messages when the connection replays events.

I also added tests in:

`src/tests/core/eventReconciler.test.ts`

The tests cover:

* Out-of-order events
* Already processed events
* Duplicate events after reconnect

I also tested this manually with Chaos Mode enabled and checked that duplicate events were delivered by the simulator but only applied once by the UI.

## Arabic and RTL

The UI supports both Arabic and English.

The language selector changes the page between RTL and LTR.

The transcript direction also follows the call language.

I included mixed Arabic/English examples in the simulator because mixed-direction text is something I wanted to check rather than only testing Arabic text by itself.

## Accessibility

I tried to keep the UI usable with the keyboard and screen readers.

The main things I added were:

* Keyboard-accessible call selection
* Focus moved to Call Details after selecting a call
* Semantic headings for the different sections
* Proper RTL/LTR document direction
* Live announcements for important events instead of announcing every incoming event

I tested the Call Details section with VoiceOver and checked that the main information and sections can be navigated using the keyboard.

I also kept the live announcements limited to important events. At around 30 events per second, announcing every transcript, sentiment, or tool update would not be useful for a screen reader user.

## Performance

The simulator generates around 30 events per second.

I used Chrome DevTools Performance with Chaos Mode enabled to check the application under this load.

For one 50.3 second recording, DevTools showed:

* Scripting: 5,595 ms
* Rendering: 238 ms
* Painting: 98 ms
* Total recording: 50.3 seconds

I also avoided updating React state for every incoming event.

The event reconciler handles the incoming events first, and the React state is refreshed on a 100ms interval when there are changes. This means the event processing can happen at the simulator's event rate without forcing a React render for every event.

## Some decisions I made

### Keep the reconciliation logic outside React

I could have handled the event ordering directly inside the React hook, but I wanted this logic to be independent from the UI.

Keeping it in `EventReconciler` also made it easier to write unit tests for the important correctness cases.

### Keep the simulator simple

I didn't add a backend or real WebSocket connection for this assessment.

The simulator is enough to reproduce the situations I needed to test, including duplicates, reordering, disconnects, and reconnects.

I wanted to spend the available time on the frontend behavior rather than building backend infrastructure.

### Keep live announcements limited

I didn't want the screen reader to announce every transcript, sentiment, and tool event because at 30 events per second that would not be useful.

Instead, announcements are limited to important things such as a new handoff request or a call becoming urgent or requiring review.

## What I didn't build

I intentionally left out some things to keep the scope manageable:

* Real backend/WebSocket integration
* Authentication
* Persistent call history
* Advanced search and filtering
* Production deployment
* Full supervisor roles and permissions
* Advanced sentiment charts
* A full design system

For this assessment, I felt these were less important than getting the core live-call behavior working correctly.

## Decision log

One decision I changed during development was around the event handling.

Initially, the event processing was closely tied to the live UI. While working through the chaos requirement, I changed the approach and separated the event reconciliation into `EventReconciler`.

This made the duplicate and ordering behavior easier to reason about and test.

I completed the implementation before making my first Git commit, so there is no earlier commit showing this change in the repository history.

## If I had some more time

I would focus mostly on making the current implementation more production-ready rather than adding a lot more UI.

I would work on:

* Replacing the simulator with a real WebSocket/event stream
* More validation for invalid or unexpected events
* Better monitoring of dropped and buffered events
* More automated accessibility testing
* More performance testing with larger numbers of calls
* Transcript virtualization for much larger transcripts
* More supervisor filtering and search
* End-to-end tests for the main workflows
* Production error handling and monitoring

I think this architecture section is enough. **Don't add a complicated diagram or more architecture terminology**—during the walkthrough, you should be able to explain this flow naturally in a minute or two.
