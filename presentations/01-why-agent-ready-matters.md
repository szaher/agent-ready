---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'Why Agent-Ready Matters'
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

# Why Agent-Ready Matters

## Module 1 -- Agent Ready Academy

Your codebase is no longer just for humans to read. It is for machines to act on.

---

# Agenda

- The Agentic Shift -- from autocomplete to autonomous agents
- What Is Agent-Ready? -- the four pillars
- The Agent-Ready Maturity Model -- Level 0 through Level 4
- Your First Agent Session -- seeing the difference firsthand
- Measuring Agent Effectiveness -- tracking what matters

<!-- Speaker note: This module sets the foundation for the entire academy. By the end, participants should understand why agent readiness is a competitive advantage and know how to assess their own codebase. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# The Agentic Shift

## How AI coding tools evolved from suggesting lines to driving features

---

# Three Waves of AI-Assisted Coding

<div class="mermaid">
graph LR
    A["Wave 1<br/>Autocomplete"] -->|"more context"| B["Wave 2<br/>Copilot"]
    B -->|"more autonomy"| C["Wave 3<br/>Agent"]
    style A fill:#e2e8f0,stroke:#4a5568,color:#1a202c
    style B fill:#bee3f8,stroke:#3182ce,color:#1a202c
    style C fill:#c6f6d5,stroke:#38a169,color:#1a202c
</div>

- **Autocomplete** -- predicts the next few tokens in the current file
- **Copilot** -- chat-based; generates functions, explains code, refactors on request
- **Agent** -- plans multi-file changes, runs commands, iterates until the task is done

> The human shifts from typist to reviewer.

<!-- Speaker note: The key insight is increasing autonomy at each wave. In Wave 1, the AI suggests; in Wave 2, it generates on demand; in Wave 3, it pursues a goal independently. Ask participants which wave they currently use most. -->

---

# What Makes an Agent Different

An AI coding agent has four capabilities that set it apart:

- **Planning** -- breaks a high-level request into concrete steps
- **Tool use** -- reads files, writes code, runs terminal commands
- **Iteration** -- observes results and adjusts its approach
- **Multi-file scope** -- operates across the entire repository

<div class="mermaid">
graph TD
    subgraph Agent["AI Coding Agent Loop"]
        P["Plan"] --> E["Execute"]
        E --> O["Observe"]
        O --> A["Adjust"]
        A --> E
    end
    U["Developer Request"] --> P
    O --> R["Result"]
    style Agent fill:#ebf8ff,stroke:#3182ce
    style U fill:#fefcbf,stroke:#d69e2e,color:#1a202c
    style R fill:#c6f6d5,stroke:#38a169,color:#1a202c
</div>

<!-- Speaker note: The plan-execute-observe-adjust loop is the defining pattern of agentic behavior. A copilot generates code when asked. An agent pursues a goal. Emphasize that this loop means codebase quality directly affects how fast the agent converges. -->

---

# Why This Changes Everything

When your coding assistant autonomously navigates a codebase, the quality of that codebase becomes a **direct multiplier** on the assistant's effectiveness.

- **Well-prepared repo** -- agent reads context, follows conventions, tests pass first try
- **Unprepared repo** -- agent guesses at patterns, produces inconsistent code, enters fix loops

### The opportunity

- A single developer with a well-configured agent can produce the throughput of a small team
- Agents follow documented conventions perfectly, every time
- Repetitive tasks like writing tests and updating boilerplate become delegatable

<!-- Speaker note: This is the core value proposition. Make it concrete: ask participants to think about the last time they wished they had a junior developer who could write all the boilerplate tests. That is what a well-prepared agent delivers. -->

---

# Key Takeaway -- The Agentic Shift

> The software industry is moving from AI tools that suggest code to AI agents that autonomously plan, execute, and iterate on complex tasks. Your codebase is no longer just something humans read -- it is something machines act on. Preparing for this shift is not optional.

<!-- Speaker note: Pause here and let this sink in. This is the thesis of the entire module. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# What Is Agent-Ready?

## The four pillars that determine whether an agent can work productively in your repository

---

# The Four Pillars of Agent Readiness

<div class="mermaid">
graph TD
    AR["Agent-Ready<br/>Codebase"] --> C["Context"]
    AR --> CV["Conventions"]
    AR --> CS["Constraints"]
    AR --> FL["Feedback Loops"]
    C --- C1["Project purpose<br/>Architecture overview<br/>Key decisions"]
    CV --- CV1["Code style<br/>File organization<br/>Naming patterns"]
    CS --- CS1["Off-limits areas<br/>Security boundaries<br/>Architectural rules"]
    FL --- FL1["Tests<br/>Linters<br/>Type checkers"]
    style AR fill:#ebf8ff,stroke:#3182ce,color:#1a202c
    style C fill:#c6f6d5,stroke:#38a169,color:#1a202c
    style CV fill:#bee3f8,stroke:#3182ce,color:#1a202c
    style CS fill:#fefcbf,stroke:#d69e2e,color:#1a202c
    style FL fill:#fed7d7,stroke:#e53e3e,color:#1a202c
</div>

<!-- Speaker note: Each pillar addresses a different failure mode. Context prevents blindness. Conventions prevent inconsistency. Constraints prevent damage. Feedback loops prevent silent failures. Walk through each one briefly here; the next slide goes deeper. -->

---

# Agent-Ready vs. Developer-Ready

| Aspect | Developer-Ready | Agent-Ready |
|--------|----------------|-------------|
| Documentation | <span class="vs-neutral">Helpful but optional</span> | <span class="vs-good">Essential</span> |
| Conventions | <span class="vs-neutral">Absorbed through culture</span> | <span class="vs-good">Must be explicitly written</span> |
| Constraints | <span class="vs-neutral">Enforced via code review</span> | <span class="vs-good">Stated upfront and verifiable</span> |
| Feedback speed | <span class="vs-neutral">Important</span> | <span class="vs-good">Critical for iteration loops</span> |
| Examples | <span class="vs-neutral">Nice to have</span> | <span class="vs-good">Primary learning mechanism</span> |

*Making your codebase agent-ready also makes it better for humans. Every investment pays dividends in both directions.*

<!-- Speaker note: This table is powerful for skeptics. Point out that agent readiness is not extra work on top of good practices -- it is a sharper version of the same good practices. The difference is that agents cannot ask a colleague, absorb team culture, or infer from code reviews. Everything must be explicit. -->

---

# Key Takeaway -- The Four Pillars

<div class="callout">

**Remember:** An agent-ready codebase provides explicit **context**, documented **conventions**, clear **constraints**, and fast **feedback loops**. These four pillars ensure that an AI agent can work productively from its first interaction.

</div>

> A well-written CLAUDE.md is the single highest-leverage investment you can make in agent readiness.

<!-- Speaker note: Emphasize that CLAUDE.md (or AGENTS.md, .cursorrules) is the centerpiece. We will build one from scratch in Module 2. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# The Agent-Ready Maturity Model

## A five-level framework for assessing and improving your codebase

---

# The Five Levels

<div class="mermaid">
graph LR
    L0["Level 0<br/>Unaware"] --> L1["Level 1<br/>Foundational"]
    L1 --> L2["Level 2<br/>Structured"]
    L2 --> L3["Level 3<br/>Optimized"]
    L3 --> L4["Level 4<br/>Autonomous"]
    style L0 fill:#fed7d7,stroke:#e53e3e,color:#1a202c
    style L1 fill:#fefcbf,stroke:#d69e2e,color:#1a202c
    style L2 fill:#bee3f8,stroke:#3182ce,color:#1a202c
    style L3 fill:#c6f6d5,stroke:#38a169,color:#1a202c
    style L4 fill:#e9d8fd,stroke:#805ad5,color:#1a202c
</div>

| Aspect | Level 0 | Level 1 | Level 2 | Level 3 | Level 4 |
|--------|---------|---------|---------|---------|---------|
| Instruction file | <span class="vs-bad">None</span> | <span class="vs-bad">None</span> | <span class="vs-good">Basic</span> | <span class="vs-good">Hierarchical</span> | <span class="vs-good">Comprehensive</span> |
| Build/test | <span class="vs-bad">Unreliable</span> | <span class="vs-neutral">Works</span> | <span class="vs-neutral">Fast</span> | <span class="vs-good">Very fast</span> | <span class="vs-good">Automated gates</span> |
| Task completion | <span class="vs-bad">~20%</span> | <span class="vs-neutral">~40%</span> | <span class="vs-neutral">~65%</span> | <span class="vs-good">~80%</span> | <span class="vs-good">~90%+</span> |
| Human correction | <span class="vs-bad">Always</span> | <span class="vs-bad">Usually</span> | <span class="vs-neutral">Sometimes</span> | <span class="vs-good">Rarely</span> | <span class="vs-good">Review only</span> |

<!-- Speaker note: Walk through the table row by row. The task completion rate jump from Level 0 to Level 2 is dramatic -- 20% to 65%. That alone justifies the investment. Ask participants to silently guess their own level. -->

---

# Progression Path

Do not try to jump from Level 0 to Level 3. Each level builds on the previous one.

1. **Today** -- ensure your build and test commands work reliably *(Level 1)*
2. **This week** -- write a basic CLAUDE.md with project overview and key commands *(Level 2)*
3. **This month** -- document your top conventions and add them to the instruction file *(Level 2)*
4. **This quarter** -- refine based on actual agent usage, add exemplar patterns *(Level 3)*

<div class="callout">

**Quick self-assessment:** Can someone clone your repo and run tests with a single command? If not, you are at Level 0. Start there.

</div>

<!-- Speaker note: The progression path is designed to be non-threatening. You do not need a weekend project. You need 30 minutes today to verify your build works, and an hour this week to write a CLAUDE.md. Emphasize that even Level 0 to Level 1 can double the agent's task completion rate. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Your First Agent Session

## Seeing the difference between prepared and unprepared repositories

---

# Without Context vs. With Context

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Start a session in your project
cd your-project && claude

# Give it a task:
# "Add a power function and write tests for all calculator functions"
```

**Without CLAUDE.md:** the agent guesses the test framework, file locations, and code style. It installs Jest when your team uses Vitest. It puts tests in `__tests__/` when you co-locate them.

**With CLAUDE.md:** the agent reads your conventions, uses the correct framework, follows your patterns, and runs the right test command. No guesswork. No wasted iterations.

<!-- Speaker note: If you can do a live demo, this is the slide where you switch to the terminal and show both scenarios. If not, walk through the two sequence diagrams conceptually. The before/after is the most persuasive argument for agent readiness. -->

---

# What to Watch For in Agent Sessions

Pay attention to these signals during every agent interaction:

- **Startup time** -- how long before the agent starts writing code? Long setup means it is struggling to understand the project
- **Clarification questions** -- good agents ask, but asking about basic conventions signals poor preparation
- **Iteration count** -- multiple test-fail-fix cycles mean unclear conventions or slow feedback
- **Style match** -- compare the agent's code to existing code; mismatches mean missing documentation

<div class="callout">

**Tip:** Start with a task you already know the correct answer to. That way you can evaluate the agent's output against your own expectations.

</div>

<!-- Speaker note: These four signals give participants an immediate checklist for their first session. Encourage them to try it today on one of their real projects. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Measuring Agent Effectiveness

## Five metrics that turn subjective impressions into data-driven improvement

---

# The Five Core Metrics

| Metric | What It Measures | Target |
|--------|-----------------|--------|
| **Task Completion Rate** | Does the agent finish the job? | <span class="vs-good">> 70%</span> |
| **Iteration Count** | How many tries does it take? | <span class="vs-good">< 3</span> |
| **Human Intervention Rate** | How often must a human step in? | <span class="vs-good">< 30%</span> |
| **Convention Adherence** | Does output match team standards? | <span class="vs-good">> 85%</span> |
| **Time to Completion** | How long does the full cycle take? | <span class="vs-good">< 5 min</span> |

> What gets measured gets improved. Track your agent's performance the same way you track test coverage or deployment frequency.

<!-- Speaker note: These five metrics together paint a complete picture. No single metric tells the whole story. A high completion rate with low convention adherence means the code works but does not match your team's style. A low iteration count with high intervention means the agent finishes fast but a human has to clean up. Cover each metric briefly and emphasize the targets as aspirational starting points. -->

---

# From Baseline to Improvement

**Step 1:** Run 10-15 tasks across different areas of your codebase. Log completion, iterations, interventions, and time. This is your **baseline**.

**Step 2:** Make one agent-readiness improvement (add CLAUDE.md, document conventions, speed up tests).

**Step 3:** Run another 10-15 tasks and compare against your baseline.

**Step 4:** Identify the weakest metric and target your next improvement there.

<div class="callout">

**Real-world results:** One team added a CLAUDE.md and documented conventions. Task completion rate went from 42% to 68%. Iteration count dropped from 4.1 to 2.4. Average time was cut in half.

</div>

<!-- Speaker note: The numbers in the callout come from the lesson content and represent realistic improvements. Stress that this is not hypothetical -- these gains come from simply writing down what the team already knows. -->

---

# Key Takeaway -- Measurement

> Every intervention category maps directly to an agent-readiness improvement. Convention mismatches? Document your conventions. Missing context? Add an architecture overview. Wrong approach? Write task-specific workflow guides. Scope creep? Add constraints and boundaries.

Measurement turns agent readiness from a subjective impression into a **data-driven practice**.

<!-- Speaker note: This closes the loop on the module. The maturity model tells you where you are. The metrics tell you how to improve. The four pillars tell you what to build. Together, they form the complete framework for Module 1. -->

---

# Module 1 Summary

- The **agentic shift** is real -- agents plan, execute, and iterate autonomously
- **Agent-ready** means four pillars: context, conventions, constraints, feedback loops
- The **maturity model** gives you a roadmap from Level 0 to Level 4
- Even a **minimal CLAUDE.md** dramatically improves agent performance
- **Five metrics** let you track and improve agent effectiveness with data

### What is next

**Module 2: Building Your First CLAUDE.md** -- the single most impactful artifact for agent readiness.

<!-- Speaker note: Recap the five key points. Ask if there are any questions before moving to Q&A. Remind participants that Module 2 is where they will get hands-on and build the instruction file for their own projects. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Questions?

## Thank you

Agent Ready Academy -- Module 1: Why Agent-Ready Matters
