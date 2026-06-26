---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'Custom Agents and Multi-Agent Patterns'
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

# Custom Agents and Multi-Agent Patterns

## From General-Purpose to Specialized Workflows

Agent Ready Academy | Module 4

<!-- Speaker note: This module builds on the CLAUDE.md foundation from Module 3. Participants should already understand project instructions before we add agent-level specialization. -->

---

# Agenda

- Why custom agents -- when specialization beats general-purpose
- The agent definition format -- markdown files in `.claude/agents/`
- Controlling tools and permissions per agent
- Hands-on: building a code reviewer agent from scratch
- Multi-agent orchestration -- teams, pipelines, and fan-out
- Choosing the right pattern for your workflow

<!-- Speaker note: We will move from concept to practice. By the end, participants should be able to define a custom agent and reason about when multi-agent coordination is worth the overhead. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## Why Custom Agents?

When a single agent tries to do everything, it excels at nothing.

<!-- Speaker note: Start by surfacing the pain points that motivate specialization. Ask the audience if they have ever had an AI agent do something it should not have. -->

---

# The Problem with One Agent for Everything

A general-purpose agent is a Swiss Army knife -- capable, but never the best tool for any single job.

- **Overly broad permissions** -- a review agent with write access might "helpfully" fix issues instead of flagging them
- **Conflicting instructions** -- "be thorough and flag every issue" clashes with "be concise and only change what is necessary"
- **Context dilution** -- the system prompt grows to cover every role, and the instructions that matter get less attention

<div class="mermaid">
graph TD
    P1["Overly Broad Permissions"] --> R1["Agent modifies files\nwhen it should only read"]
    P2["Conflicting Instructions"] --> R2["Review rules clash\nwith writing rules"]
    P3["Context Dilution"] --> R3["System prompt is so long\nthe agent loses focus"]
    style P1 fill:#fed7d7,stroke:#e53e3e
    style P2 fill:#fed7d7,stroke:#e53e3e
    style P3 fill:#fed7d7,stroke:#e53e3e
    style R1 fill:#fff5f5,stroke:#fc8181
    style R2 fill:#fff5f5,stroke:#fc8181
    style R3 fill:#fff5f5,stroke:#fc8181
</div>

<!-- Speaker note: Each problem compounds the others. A bloated prompt with broad permissions is the worst combination -- the agent is confused AND powerful. -->

---

# The Case for Specialization

Custom agents apply the **principle of least privilege**: each agent gets a focused role, targeted instructions, and only the permissions it needs.

<div class="mermaid">
graph LR
    subgraph General["General-Purpose Agent"]
        GA["One agent\nAll permissions\nAll instructions"]
    end
    subgraph Specialized["Specialized Agents"]
        SA["Reviewer\nRead-only"]
        SB["Test Writer\nRead + Write"]
        SC["Refactorer\nRead + Edit"]
        SD["Docs Generator\nRead + Write"]
    end
    General -.->|"specialize"| Specialized
    style General fill:#fed7d7,stroke:#e53e3e
    style Specialized fill:#c6f6d5,stroke:#38a169
    style SA fill:#ebf8ff,stroke:#3182ce
    style SB fill:#ebf8ff,stroke:#3182ce
    style SC fill:#ebf8ff,stroke:#3182ce
    style SD fill:#ebf8ff,stroke:#3182ce
</div>

> The less an agent can do, the more you can trust it to do its job unsupervised.

<!-- Speaker note: This mirrors microservices architecture -- single responsibility, clear interfaces, independent scaling. The analogy resonates with engineers. -->

---

# When Specialization Pays Off (and When It Does Not)

| Scenario | Custom Agent? | Why |
|----------|---------------|-----|
| Repeated code reviews across repos | <span class="vs-good">Yes</span> | Amortizes setup cost over hundreds of uses |
| Safety-critical operations | <span class="vs-good">Yes</span> | Restricted permissions reduce blast radius |
| Team-shared workflows | <span class="vs-good">Yes</span> | Checked into repo, identical for every developer |
| One-off exploratory task | <span class="vs-bad">No</span> | General-purpose agent is faster to use |
| Rapidly changing requirements | <span class="vs-bad">No</span> | Maintaining the agent definition adds overhead |
| Compliance-driven automation | <span class="vs-good">Yes</span> | Defined permission boundaries satisfy auditors |

<!-- Speaker note: The key question is frequency times risk. High frequency or high risk -- build a custom agent. Low frequency and low risk -- just use the general agent. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## The Agent Definition Format

Every custom agent is a single markdown file in `.claude/agents/`.

<!-- Speaker note: This section covers the mechanics. Participants will need their laptops open for the next few slides. -->

---

# Agent File Location and Structure

Agent definitions live in `.claude/agents/` at the repository root. The filename becomes the invocation identifier.

<div class="mermaid">
graph TD
    subgraph Repo["Repository Root"]
        A[".claude/"] --> B["agents/"]
        B --> C["code-reviewer.md"]
        B --> D["test-writer.md"]
        B --> E["doc-generator.md"]
        B --> F["security-auditor.md"]
        A --> G["settings.json"]
        H["CLAUDE.md"]
    end
    style Repo fill:#f7fafc,stroke:#4a5568
    style B fill:#b794f4,stroke:#6b46c1,color:#ffffff
    style C fill:#ebf8ff,stroke:#3182ce
    style D fill:#ebf8ff,stroke:#3182ce
    style E fill:#ebf8ff,stroke:#3182ce
    style F fill:#ebf8ff,stroke:#3182ce
    style G fill:#e2e8f0,stroke:#4a5568
    style H fill:#63b3ed,stroke:#3182ce,color:#ffffff
</div>

- Use **kebab-case** filenames: `code-reviewer.md`, not `CodeReviewer.md`
- Check agent definitions into version control -- they are infrastructure

<!-- Speaker note: Emphasize that the filename IS the identifier. Running 'ls .claude/agents/' should tell you exactly what agents are available. -->

---

# Anatomy of an Agent Definition

The file has two parts: a **heading** that names the agent, and a **body** that serves as its system prompt. The body is composed alongside your CLAUDE.md -- not instead of it.

```markdown
# Code Reviewer

You are a meticulous senior code reviewer. Your job is to
analyze code changes and provide actionable feedback.

You do NOT fix issues. You observe, analyze, and report.

## Review Methodology
1. **Correctness** -- logic errors, off-by-one mistakes
2. **Security** -- input validation, injection risks
3. **Performance** -- unnecessary allocations, O(n^2) loops
4. **Readability** -- naming, complexity justification
5. **Conventions** -- adherence to project patterns

## Constraints
- NEVER modify, edit, or write any files
- NEVER run shell commands or execute tests
```

<!-- Speaker note: Walk through each section. Point out that constraints come LAST but are arguably the most important part. The heading is the display name developers see when selecting an agent. -->

---

# How CLAUDE.md and Agent Definitions Combine

CLAUDE.md provides project context. The agent definition provides role-specific behavior. Together they produce a focused, context-aware agent.

<div class="mermaid">
graph LR
    A["CLAUDE.md\nProject context\nConventions\nArchitecture"] --> C["Agent's Effective Prompt"]
    B["Agent Definition\nRole instructions\nBehavior rules\nOutput format"] --> C
    C --> D["Focused Agent Behavior"]
    style A fill:#63b3ed,stroke:#3182ce,color:#ffffff
    style B fill:#b794f4,stroke:#6b46c1,color:#ffffff
    style C fill:#fefcbf,stroke:#d69e2e
    style D fill:#c6f6d5,stroke:#38a169
</div>

<div class="callout">

**Think of it this way:** CLAUDE.md is the employee handbook every team member reads. Agent definitions are the job descriptions that define each role.

</div>

<!-- Speaker note: This is a critical mental model. Without CLAUDE.md the agent knows its role but not the project. Without the agent definition it knows the project but not its role. Both are necessary. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## Agent Tools and Permissions

System prompt constraints are suggestions. Tool permissions are enforced boundaries.

<!-- Speaker note: This is the section where we move from behavioral guidelines to technical enforcement. The distinction between should and can is the key insight. -->

---

# The Permission Spectrum

Different roles need different levels of trust. Grant the minimum permissions each agent requires.

| Level | Tools Allowed | Example Agent |
|-------|--------------|---------------|
| <span class="vs-good">Observe</span> | Read, WebSearch | Code reviewer, security auditor |
| <span class="vs-neutral">Suggest</span> | Read, WebSearch, WebFetch | Architecture analyst |
| <span class="vs-neutral">Edit</span> | Read, Edit, Write | Test writer, refactorer |
| <span class="vs-bad">Execute</span> | Read, Edit, Write, Bash | Build verifier |
| <span class="vs-bad">Full</span> | All tools + MCP | CI/CD automation |

<div class="callout">

**Defense in depth:** System prompt constraints tell the agent what it **should** do. Tool permissions control what it **can** do. Use both.

</div>

<!-- Speaker note: Most custom agents should live at the Observe or Edit level. Full access should be rare and well-justified. Ask: which of your current workflows would benefit from restricted permissions? -->

---

# Building a Code Reviewer -- The Complete Agent

```markdown
# Code Reviewer

You are a meticulous senior code reviewer. You observe, analyze, and report.
You do NOT fix issues. You do NOT modify code.

## Before You Review
1. Read CLAUDE.md for project conventions
2. Read the changed files for full context
3. Read imports to understand interfaces
4. Check for existing tests

## Output Format
### Summary
One paragraph + overall assessment (Approve / Request Changes / Needs Discussion)
### Issues Found
**[CRITICAL]** file.ext:L42 -- Description and explanation
**[WARNING]** file.ext:L87 -- Risk and conditions
**[NIT]** file.ext:L15 -- Minor suggestion
### Verdict
- Critical: N | Warnings: N | Nits: N
- Recommendation: Approve / Request Changes / Needs Discussion

## Constraints
- NEVER modify, edit, or write any files
- NEVER run shell commands or execute tests
- Limit review to changed files only
```

<!-- Speaker note: This is the complete file that goes into .claude/agents/code-reviewer.md. Walk through it top to bottom. The output format is rigid by design -- consistency makes reviews scannable. -->

---

# The Agent Lifecycle in Action

When you invoke the code reviewer, here is the complete flow:

<div class="mermaid">
sequenceDiagram
    participant Dev as Developer
    participant CLI as Claude CLI
    participant Agent as Code Reviewer
    participant FS as Filesystem

    Dev->>CLI: claude --agent code-reviewer
    CLI->>CLI: Load CLAUDE.md + agent definition
    CLI->>Agent: Initialize with combined prompt
    Dev->>Agent: "Review changes in src/auth.ts"
    Agent->>FS: Read src/auth.ts
    Agent->>FS: Read CLAUDE.md
    Agent->>FS: Read related imports
    Agent->>FS: Check existing tests
    Agent-->>Dev: Structured review report
    Note over Agent,Dev: Agent NEVER calls Edit, Write, or Bash
</div>

<!-- Speaker note: Trace the sequence step by step. The key takeaway is that the entire lifecycle is read-only. The agent gathers context from multiple files but never modifies anything. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Multi-Agent Orchestration

One agent, one job. Many agents, complex workflows.

<!-- Speaker note: Transition from single agents to coordination. Ask: what happens when a feature request needs review, implementation, testing, and documentation? -->

---

# Three Orchestration Patterns

<div class="mermaid">
flowchart TD
    Start["Complex task"] --> Q1{"Do subtasks\ndepend on each other?"}
    Q1 -->|"No dependencies"| FanOut["Fan-Out\nParallel execution"]
    Q1 -->|"Yes"| Q2{"Is the sequence\nfixed and predictable?"}
    Q2 -->|"Fixed stages"| Pipeline["Pipeline\nSequential stages"]
    Q2 -->|"Needs judgment"| Team["Team\nOrchestrator + workers"]
    style Start fill:#e2e8f0,stroke:#4a5568
    style FanOut fill:#c6f6d5,stroke:#38a169
    style Pipeline fill:#ebf8ff,stroke:#3182ce
    style Team fill:#b794f4,stroke:#6b46c1,color:#ffffff
</div>

| Pattern | Best For | Trade-off |
|---------|----------|-----------|
| **Team** | Dynamic, multi-skill tasks | <span class="vs-neutral">Higher token cost, flexible</span> |
| **Pipeline** | Fixed sequential workflows | <span class="vs-neutral">Latency compounds, predictable</span> |
| **Fan-Out** | Parallel independent work | <span class="vs-good">Fastest wall-clock time</span> |

<!-- Speaker note: This decision tree is the framework to internalize. Start from the task, not from the pattern. The right pattern falls out of the task's constraints. -->

---

# The Team Pattern -- Orchestrator + Workers

A leader agent decomposes the task, delegates to specialists, and synthesizes results.

<div class="mermaid">
graph TD
    Dev["Developer"] --> Orch["Team Lead\n(Orchestrator)"]
    Orch --> W1["Code Reviewer\nRead-only"]
    Orch --> W2["Test Writer\nRead + Write"]
    Orch --> W3["Doc Generator\nRead + Write"]
    W1 --> Orch
    W2 --> Orch
    W3 --> Orch
    Orch --> Dev
    style Dev fill:#fefcbf,stroke:#d69e2e,color:#1a202c
    style Orch fill:#b794f4,stroke:#6b46c1,color:#ffffff
    style W1 fill:#ebf8ff,stroke:#3182ce
    style W2 fill:#ebf8ff,stroke:#3182ce
    style W3 fill:#ebf8ff,stroke:#3182ce
</div>

**Use when:** tasks need multiple skills, order requires judgment, you want a single point of contact.

<!-- Speaker note: The orchestrator has broader permissions because it needs to read and delegate. But the workers stay tightly scoped. The orchestrator should NOT do the work itself -- if its prompt has implementation details, it is not delegating enough. -->

---

# Pipeline and Fan-Out Patterns

**Pipeline** -- sequential stages where each output feeds the next:

```
Analyzer --> Implementer --> Reviewer --> Tester
   |              |              |           |
 Read-only    Read+Write     Read-only   Read+Bash
```

**Fan-Out** -- same task dispatched to independent units in parallel:

```
         Dispatcher
        /    |    \
Review    Review    Review     (parallel, independent)
mod-auth  mod-api   mod-db
        \    |    /
         Collector
```

<div class="callout">

**Combine patterns freely:** A team lead can fan-out reviews across modules, then pipeline the results through implementation and testing.

</div>

<!-- Speaker note: Pipelines have stop-on-failure semantics -- if stage 2 fails, stage 3 should not run. Fan-out only works when tasks are truly independent -- two agents editing the same file is a recipe for conflicts. -->

---

# Anti-Patterns and Practical Advice

Avoid these common mistakes when orchestrating multiple agents:

- **Over-orchestration** -- three agents for a task one agent handles perfectly
- **Shared state conflicts** -- two agents editing the same file simultaneously
- **Missing error handling** -- a pipeline where stage 2 fails but stage 3 runs anyway
- **Orchestrator bloat** -- the team lead doing all the work instead of delegating
- **Circular dependencies** -- Agent A waits on Agent B, which waits on Agent A

> Start with a single agent. Add orchestration only when you have a clear reason: different permission levels, different skill sets, or parallelism for performance.

<!-- Speaker note: Token costs multiply with each agent. A four-agent team uses roughly four times the tokens. The quality improvement must justify the cost. Start simple, split responsibilities only as pain points emerge. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Questions?

## Key Takeaways

Custom agents apply least privilege and separation of concerns.
Every agent is a markdown file in `.claude/agents/`.
Tool permissions enforce what system prompts suggest.
Teams, pipelines, and fan-out solve different coordination problems.

Agent Ready Academy

<!-- Speaker note: Recap the four takeaways. Direct participants to the Module 4 lessons in the academy for deeper coverage with interactive quizzes and code examples. -->
