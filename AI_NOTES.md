# AI Notes

I used ChatGPT during the assessment as a development and review assistant.

## Where it helped

I am currently working mainly with Vue, so moving back to React with TypeScript took some time.

Because of the time limit, I used AI assistance while writing the code for the project. I used it for most of the implementation, including components, hooks, core logic, tests, and some accessibility-related changes.

I also used ChatGPT to help me:

* Break the assessment requirements into smaller development tasks.
* Think through the event reconciliation approach.
* Create test cases for duplicate and out-of-order events.
* Review the accessibility implementation.
* Think through keyboard navigation and screen reader behavior.
* Review how to measure the application's performance.
* Review the project against the assessment requirements.
* Write and improve some of the documentation.

I did not treat the generated code as something I could just use without checking it. I ran the application, tested the behavior, and reviewed the suggestions while working through the implementation.

## Where I overrode the suggestions

I did not apply every suggestion from AI.

For example, there was a suggestion to change the simulator to keep track of active partial transcripts. After reviewing it against the existing simulator, I decided not to make that change and kept the existing implementation.

I also decided not to add performance instrumentation to the application. Instead, I used Chrome DevTools Performance to measure the application externally.

During the accessibility work, I also checked the suggested changes myself using keyboard navigation and VoiceOver rather than assuming the implementation was correct just because the suggested ARIA attributes were added.

## One thing AI got confidently wrong

The clearest example was the suggested `activePartials` change in the simulator.

The suggestion was to add extra state to track active partial transcripts and use it to manage the partial-to-final transcript flow.

It sounded reasonable, but after looking at the existing implementation, I decided it was not needed for this assessment and did not apply it.

This was a good reminder for me that an AI suggestion can sound technically correct but still not be the right solution for the actual code or the scope of the task.

## How I used AI

AI was a significant part of the implementation because I was moving back from my current Vue work to React with TypeScript and wanted to use the available time effectively.

I mainly used ChatGPT as a coding assistant and a second pair of eyes.

I still reviewed the code, ran the application, tested the important behavior, and made the final decisions about what to keep or change.

The final implementation was therefore not just based on accepting AI suggestions. I used AI to speed up the implementation, while validating the important parts myself.
