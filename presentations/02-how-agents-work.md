---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'How AI Coding Agents Work'
paginate: true
---

<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: true, theme: "base", themeVariables: { primaryColor: "#e0f0ff", primaryTextColor: "#151515", primaryBorderColor: "#0066cc", lineColor: "#0066cc", secondaryColor: "#daf2f2", tertiaryColor: "#f2f2f2", noteBkgColor: "#fef0f0", noteTextColor: "#151515", fontFamily: "Red Hat Text, sans-serif" }});
</script>

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# How AI Coding Agents Work

## From Autocomplete to Autonomous Coding Partners

Agent Ready Academy | Module 2

<!-- Speaker note: Welcome everyone. This module lifts the hood on what actually happens when you tell a coding agent to fix a bug or build a feature. Understanding the internals will make you a much more effective operator. -->

---

# Agenda

- The Observe-Plan-Act-Verify loop
- Context windows -- tokens, limits, and the "lost in the middle" effect
- Tool use -- how agents read, edit, search, and execute
- Decision making -- greedy vs. planning behavior
- Common failure modes -- and how to avoid them

<!-- Speaker note: We will spend roughly equal time on each topic. The goal is to build an accurate mental model, not to memorize implementation details. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## Anatomy of an Agent

What separates an agent from a chatbot?

<!-- Speaker note: The key distinction is agency -- the ability to take actions in the real world, observe results, and iterate. A chatbot answers questions; an agent does work. -->

---

# What Makes an Agent?

A coding agent is an LLM wrapped in a **control loop** that can take real actions in your development environment.

- **LLM Core** -- the language model that reasons about code
- **Tool Belt** -- file I/O, shell access, search capabilities
- **Control Loop** -- the orchestration that ties it all together
- **Memory** -- the conversation history and context it carries

> A chatbot answers questions. An agent ships code.

<!-- Speaker note: Emphasize that the LLM alone is not an agent. The agent emerges from the combination of the model, the tools, and the loop that connects them. -->

---

# The Observe-Plan-Act-Verify Loop

<div class="mermaid">
graph TD
    A["Observe<br/>Read files, check errors,<br/>understand context"] --> B["Plan<br/>Decide what to do next,<br/>break into steps"]
    B --> C["Act<br/>Edit code, run commands,<br/>create files"]
    C --> D["Verify<br/>Run tests, check output,<br/>validate results"]
    D --> E{Done?}
    E -->|No| A
    E -->|Yes| F["Report<br/>Summarize what was done"]
    style A fill:#e0f0ff,stroke:#0066cc
    style B fill:#daf2f2,stroke:#0066cc
    style C fill:#e0f0ff,stroke:#0066cc
    style D fill:#daf2f2,stroke:#0066cc
    style F fill:#f2f2f2,stroke:#0066cc
</div>

This loop runs continuously until the task is complete or the agent gets stuck.

<!-- Speaker note: Walk through a concrete example -- user says "fix the failing test." The agent observes the error, plans a fix, edits the file, runs the test, and checks the result. If the test still fails, it loops back. -->

---

# Each Phase in Practice

| Phase       | What the Agent Does                          | Example                                |
|-------------|----------------------------------------------|----------------------------------------|
| **Observe** | Reads files, errors, test output             | `Read src/api/handler.ts`              |
| **Plan**    | Reasons about the root cause, picks approach | "The null check is missing on line 42" |
| **Act**     | Edits code, runs commands                    | `Edit handler.ts` to add guard clause  |
| **Verify**  | Runs tests, checks compilation               | `Bash: npm test`                       |

<div class="callout">

**Key insight:** The quality of the **Observe** phase determines everything. An agent that reads the wrong files will plan the wrong fix.

</div>

<!-- Speaker note: Ask the audience -- what happens if the agent skips the Observe phase? It hallucinates the file contents and makes edits to code that does not look like what it imagines. This is a real and common failure. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## Context Windows

The single most important constraint on agent behavior.

<!-- Speaker note: If you learn one thing from this module, let it be how context windows work. Every agent limitation traces back to this constraint. -->

---

# What Is a Context Window?

The context window is the **total amount of text** an LLM can see at once -- measured in **tokens**.

- **1 token** is roughly 3/4 of a word (or ~4 characters)
- Current models support 100K to 200K tokens
- That sounds like a lot -- it is not

### Scale Reference

| Content                  | Approximate Tokens |
|--------------------------|------------------:|
| A single function (30 lines) | ~200 |
| A source file (500 lines)    | ~3,000 |
| 10 source files              | ~30,000 |
| An entire small codebase     | ~500,000+ |

> A 200K context window fits roughly 40 source files -- not your whole repo.

<!-- Speaker note: Do the math with the audience. Most real projects have hundreds or thousands of files. The agent can only see a tiny fraction at any given moment. This is why tool use and selective reading are so critical. -->

---

# The "Lost in the Middle" Effect

LLMs pay the most attention to the **beginning** and **end** of their context. Information in the middle gets degraded attention.

<div class="mermaid">
graph LR
    subgraph Context["Context Window"]
        A["Start<br/>HIGH attention"] ~~~ B["Middle<br/>LOW attention"] ~~~ C["End<br/>HIGH attention"]
    end
    style A fill:#68d391,stroke:#0066cc
    style B fill:#fc8181,stroke:#cc0000
    style C fill:#68d391,stroke:#0066cc
    style Context fill:#f2f2f2,stroke:#0066cc
</div>

### What This Means for Agents

- **System prompt** (start) -- reliably followed
- **Early file reads** (middle) -- may be partially forgotten
- **Recent tool results** (end) -- freshly available

<div class="callout">

**Tip:** When working with an agent, put the most important context in your prompt (start) or trigger it to re-read files right before editing (end).

</div>

<!-- Speaker note: This is based on the "lost in the middle" paper by Liu et al. It has direct practical consequences. If the agent read a file 50 turns ago, it may not remember the details accurately. Asking it to re-read is not wasteful -- it is necessary. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## Tool Use

How agents interact with your codebase.

<!-- Speaker note: Tools are the agent's hands. Without tools, the LLM can only think. With tools, it can act. Let us look at the standard toolkit. -->

---

# The Agent Toolkit

Agents interact with your environment through a fixed set of **tools**. Each tool call is a structured request.

| Tool          | Purpose                                  | When Used                      |
|---------------|------------------------------------------|--------------------------------|
| **Read**      | Read file contents                       | Understanding code             |
| **Edit**      | Replace specific text in a file          | Modifying existing code        |
| **Write**     | Create or overwrite a file               | New files, full rewrites       |
| **Bash**      | Execute shell commands                   | Tests, builds, git, installs   |
| **WebSearch** | Search the web for information           | API docs, error messages       |

> The agent does not type into your editor. It calls tools through structured JSON.

<!-- Speaker note: Emphasize that every action an agent takes goes through one of these tools. There is no magic. If you see the agent doing something unexpected, you can trace it to a specific tool call. -->

---

# Anatomy of a Tool Call

When an agent decides to use a tool, it emits a structured JSON request. The harness executes it and returns the result.

```json
{
  "tool": "Edit",
  "parameters": {
    "file_path": "/src/api/handler.ts",
    "old_string": "if (user) {",
    "new_string": "if (user && user.isActive) {"
  }
}
```

The harness then responds with success or failure, and the agent sees the result in its next observation step.

### The Full Round Trip

**Agent reasons** --> **emits tool call** --> **harness executes** --> **result returned** --> **agent observes**

<!-- Speaker note: This is the fundamental mechansim. The agent never touches your filesystem directly. The harness is the gatekeeper. This is also why permission prompts exist -- the harness asks you before running destructive operations. -->

---

# Tool Call Flow

<div class="mermaid">
sequenceDiagram
    participant U as User
    participant A as Agent (LLM)
    participant H as Harness
    participant FS as File System

    U->>A: "Fix the null pointer in handler.ts"
    A->>H: Read(/src/api/handler.ts)
    H->>FS: cat handler.ts
    FS-->>H: file contents
    H-->>A: file contents (2,400 tokens)
    A->>A: Reason about the bug
    A->>H: Edit(handler.ts, old_string, new_string)
    H->>FS: apply patch
    FS-->>H: success
    H-->>A: edit applied
    A->>H: Bash("npm test")
    H->>FS: execute
    FS-->>H: all tests pass
    H-->>A: exit code 0, output
    A->>U: "Fixed the null check. Tests pass."
</div>

<!-- Speaker note: Trace through this diagram step by step. Note how each arrow is a separate round trip. The agent cannot batch tool calls that depend on each other -- it must wait for each result before deciding the next action. Independent calls can be batched. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Agent Decision Making

How agents choose what to do -- and why they sometimes choose wrong.

<!-- Speaker note: Understanding agent decision making helps you predict when an agent will struggle and when you need to intervene with better instructions. -->

---

# Greedy vs. Planning Behavior

Agents operate on a spectrum between **greedy** (act immediately) and **planning** (think ahead).

| Behavior    | Description                                | Trade-off                              |
|-------------|--------------------------------------------|-----------------------------------------|
| <span class="vs-bad">Greedy</span>     | Edit the first thing that looks relevant   | Fast but often wrong                   |
| <span class="vs-neutral">Reactive</span>  | Read one file, edit, check, repeat         | Moderate -- common default behavior    |
| <span class="vs-good">Planning</span>   | Survey the codebase, then make a plan      | Slower but more accurate on hard tasks |

### What Influences the Behavior?

- **Task complexity** -- simple tasks trigger greedy, complex tasks trigger planning
- **Prompt framing** -- "think step by step" pushes toward planning
- **Available context** -- more context enables better planning

<div class="callout">

**Tip:** For multi-file changes, explicitly ask the agent to "read all relevant files before making changes." This forces the planning path.

</div>

<!-- Speaker note: Most agents default to reactive behavior. They read one file, make a change, and see if it works. For simple bugs this is fine. For architectural changes across many files, you want to push the agent toward planning. Your prompt is the steering wheel. -->

---

# How Agents Choose the Next Action

At each step, the agent looks at its **full conversation history** and generates the next action. The decision is shaped by:

1. **The user's original request** -- what are we trying to accomplish?
2. **Recent tool results** -- what just happened?
3. **Error signals** -- did something fail? What does the error say?
4. **Patterns in training data** -- what usually works in situations like this?

### The Decision Hierarchy

```
Priority 1: Fix the immediate error (if one exists)
Priority 2: Continue the current plan (if one was stated)
Priority 3: Explore to gather more context
Priority 4: Attempt a solution based on available information
```

> Agents are **interrupt-driven** -- a test failure or error message immediately redirects their attention.

<!-- Speaker note: This is why agents sometimes seem to lose track of the big picture. A compilation error hijacks their attention even if they were in the middle of a larger refactoring plan. You can mitigate this by restating the overall goal periodically. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 5

## Common Agent Failures

What goes wrong and how to recognize it.

<!-- Speaker note: This is the most practical section. Knowing the failure modes lets you intervene early instead of watching the agent spin its wheels for 20 turns. -->

---

# Five Failure Modes

| Failure Mode               | Symptom                                               | Root Cause                                |
|----------------------------|-------------------------------------------------------|-------------------------------------------|
| **Hallucinated paths**     | Edits a file that does not exist                      | Agent guessed the path instead of searching |
| **Wrong file edits**       | Changes the wrong function or file                    | Stale context or ambiguous naming          |
| **Infinite loops**         | Agent keeps trying the same fix repeatedly            | No new information entering the loop       |
| **Context overflow**       | Agent forgets earlier instructions or file contents   | Conversation exceeded effective context    |
| **Premature completion**   | Agent says "done" but the fix is incomplete           | Skipped the verify phase                   |

<div class="callout">

**Key rule:** If the agent has looped 3 times without progress, **intervene**. Provide new context, clarify the goal, or break the task into smaller pieces.

</div>

<!-- Speaker note: Go through each failure mode with a real example if possible. The audience should leave this slide knowing what to watch for. Hallucinated paths are the most common failure for agents working on unfamiliar codebases. -->

---

# The Context Overflow Death Spiral

When the conversation gets too long, the agent starts forgetting earlier context. This triggers a predictable cascade:

<div class="mermaid">
graph TD
    A["Long conversation<br/>fills context window"] --> B["Agent forgets<br/>earlier file contents"]
    B --> C["Agent re-reads files<br/>consuming more context"]
    C --> D["Even more context<br/>consumed"]
    D --> E["Agent forgets<br/>the original goal"]
    E --> F["Agent goes off track<br/>or starts looping"]
    style A fill:#e0f0ff,stroke:#0066cc
    style B fill:#fef0f0,stroke:#cc0000
    style C fill:#fef0f0,stroke:#cc0000
    style D fill:#fef0f0,stroke:#cc0000
    style E fill:#fc8181,stroke:#cc0000
    style F fill:#fc8181,stroke:#cc0000
</div>

### How to Prevent It

- Start new conversations for new tasks -- do not reuse a long thread
- Keep tasks focused -- one task per conversation
- Restate the goal when you notice drift

<!-- Speaker note: The death spiral is the number one reason agents fail on complex tasks. The fix is simple: start fresh. A new conversation costs nothing. A confused agent costs time. -->

---

# Summary

## What We Covered

- **The OPAV loop** -- Observe, Plan, Act, Verify is the core agent cycle
- **Context windows** -- fixed-size, tokens are scarce, middle gets lost
- **Tool use** -- structured JSON calls to Read, Edit, Write, Bash, Search
- **Decision making** -- greedy vs. planning, and how to steer toward planning
- **Failure modes** -- hallucinated paths, loops, context overflow, premature completion

## Your Takeaways

1. Agents are **loops with tools**, not magic -- understand the loop
2. Context is the **bottleneck** -- manage it deliberately
3. Your **prompt is the steering wheel** -- use it to guide behavior
4. **Intervene early** when you see failure patterns forming

<!-- Speaker note: Summarize each point briefly. Reiterate that the mental model matters more than the specifics -- if they understand the loop and the context constraint, they can reason about any agent behavior they encounter. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Questions?

## Thank you

Agent Ready Academy -- Module 2

<!-- Speaker note: Open the floor for questions. Common questions at this point: How do different models compare? How long before agents get bigger context windows? The answer to both is that the principles stay the same even as the numbers change. -->
