---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'Context Management'
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

# Context Management

## Making Every Token Count Inside the Window

Agent Ready Academy | Module 8

<!-- Speaker note: This is the most operationally impactful module in the academy. Context is the resource agents manage most, yet most teams never think about it deliberately. By the end of this deck, participants will know how to audit, distribute, persist, and optimize context for their codebases. -->

---

# Agenda

- The context challenge -- why context is the #1 bottleneck
- Context files and kits -- .ctx files, context packs, the .ctxl index
- Memory and persistence -- the Groundhog Day problem, memory types
- Optimizing context budget -- lean CLAUDE.md, self-describing code
- Context at scale -- hierarchical context, monorepo boundaries

<!-- Speaker note: We cover five lessons worth of material in this deck. The arc goes from understanding the problem, to local solutions, to system-wide strategies. Encourage participants to think about where their projects sit on the maturity spectrum. -->

---

# What Is Context?

**Context** is everything inside the agent's working memory during a session:

- **System instructions** -- CLAUDE.md, project rules, behavior guidelines
- **Conversation history** -- every message between you and the agent
- **File contents** -- every file the agent has read
- **Tool output** -- test results, search results, command output
- **Agent reasoning** -- plans, observations, intermediate thoughts

All of this competes for space in one fixed-size container: the **context window**.

> Everything outside the window is invisible. It does not exist from the agent's perspective.

<!-- Speaker note: Ask participants: "What percentage of your codebase do you think fits inside a 200K token context window?" Most will overestimate. A medium project with 500 files is already 2.5x too large. -->

---

# The Scale Mismatch

A 200K token context window sounds enormous -- until you measure what it is up against.

<div class="mermaid">
graph LR
    subgraph Repo["Typical Codebase Sizes"]
        R1["Small\n50 files\n~50K tokens"]
        R2["Medium\n500 files\n~500K tokens"]
        R3["Large\n5,000 files\n~5M tokens"]
        R4["Monorepo\n50,000+ files\n~50M+ tokens"]
    end
    subgraph Window["Context Window"]
        W1["~200K tokens"]
    end
    R2 -.->|"2.5x too large"| W1
    R3 -.->|"25x too large"| W1
    R4 -.->|"250x too large"| W1
    style Repo fill:#fefcbf,stroke:#d69e2e
    style Window fill:#e0f0ff,stroke:#0066cc
</div>

Even as context windows grow, codebases grow faster -- and **attention quality degrades with window size**.

This creates two opposite failure modes:

| Failure Mode | Cause | Symptoms |
|---|---|---|
| **Starvation** | Agent lacks key info | Wrong assumptions, duplicate code, broken conventions |
| **Drowning** | Too much irrelevant info | Diluted attention, missed details, subtle bugs |

> **The goal:** the agent has exactly the information it needs, and nothing more.

<!-- Speaker note: The key insight is that more context is not always better. An agent with 50K tokens of carefully curated code outperforms the same agent with 200K tokens dumped in. Ask participants which failure they see more often. Drowning is more common in mature teams (they over-document) while starvation is more common in teams new to agents. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## Context Files and Kits

Distributing context so agents load only what they need.

---

# The CLAUDE.md Scaling Problem

CLAUDE.md works brilliantly for small projects. But as projects grow:

- 30 lines becomes 200 becomes 500
- Every session loads all 500 lines, even for a one-file fix
- **A 500-line CLAUDE.md burns ~8,000 tokens (4% of the window) before work begins**

The fix is not to stop documenting. It is to **distribute** the documentation.

```markdown
# src/api/.ctx

## Purpose
REST API layer. Thin handlers that call service functions.

## Patterns
- Every route handler calls a service; no business logic in handlers
- Validation schemas co-located with route files
- Errors use AppError from src/errors.ts

## Testing
- Integration tests: pnpm test -- --grep "api"
```

<!-- Speaker note: Show the audience a real bloated CLAUDE.md if you have one. Count the lines, estimate the tokens (roughly 15 tokens per line of prose), then calculate the percentage of the context window it consumes. The number is usually surprising. -->

---

# Context Kits and the .ctxl Index

**.ctx files** distribute context. **Context kits** automate selecting the right ones.

<div class="mermaid">
graph TD
    A["Developer Request:\n'Fix the email retry logic'"] --> B["Context Kit"]
    B --> C{"Select relevant\ncontext files"}
    C --> D[".ctx: src/workers/"]
    C --> E[".ctx: src/services/email/"]
    C --> F["CLAUDE.md: root"]
    C -->|"skip"| G[".ctx: src/api/"]
    C -->|"skip"| H[".ctx: src/frontend/"]
    D --> I["Context Pack\n(assembled)"]
    E --> I
    F --> I
    I --> J["Agent starts with\ntargeted context"]
    style B fill:#e0f0ff,stroke:#0066cc
    style I fill:#daf2f2,stroke:#009999
    style G fill:#f2f2f2,stroke:#a0aec0
    style H fill:#f2f2f2,stroke:#a0aec0
</div>

A **.ctxl index** maps all .ctx files and their topics, enabling fast lookup without reading every file.

<!-- Speaker note: The .ctxl file is auto-generated by running a command like 'ctxkit index generate'. It lists every .ctx file, its directory scope, and its topics. The context kit matches the task description against these topics to select which .ctx files to load. This is the difference between loading 3 files and loading 30. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## Memory and Persistence

Solving the Groundhog Day problem.

---

# The Groundhog Day Problem

Without memory, every session is a **fresh start**. The agent rediscovers the same facts over and over.

<div class="mermaid">
sequenceDiagram
    participant D as Developer
    participant A1 as Session 1
    participant A2 as Session 2
    participant A3 as Session 3

    D->>A1: "Fix the flaky test in payments"
    A1->>A1: Discovers race condition in db pool
    A1->>D: Fix applied: added connection mutex
    Note over A1: Session ends. Knowledge lost.

    D->>A2: "Another flaky test in payments"
    A2->>A2: Spends 10 min rediscovering same issue
    A2->>D: Same fix, same pattern
    Note over A2: Session ends. Knowledge lost again.

    D->>A3: "Yet another payment test issue"
    A3->>A3: Rediscovers the same root cause
    Note over A3: The agent never learns.
</div>

<!-- Speaker note: This is the most viscerally frustrating experience for developers using agents. They watch the agent spend ten minutes figuring out something it already figured out last week. Multiply this across five team members and the wasted effort is enormous. -->

---

# How Memory Works

A memory system operates in three phases: **Record**, **Retrieve**, **Apply**.

| Phase | When | What Happens |
|---|---|---|
| **Record** | During/after session | System captures corrections, discoveries, facts |
| **Retrieve** | Start of new session | System searches for relevant past observations |
| **Apply** | During session | Agent uses past knowledge without rediscovery |

**Four types of memory:**

- **Project facts** -- "This project uses pnpm, not npm"
- **Feedback corrections** -- "Never use default exports"
- **Discovery notes** -- "The payment processor has a race condition under load"
- **User preferences** -- "Show diffs before applying changes"

<div class="callout">

**Rule:** When memory conflicts with CLAUDE.md, **CLAUDE.md wins**. Memory is supplementary; CLAUDE.md is the contract.

</div>

<!-- Speaker note: The hierarchy matters. CLAUDE.md is version-controlled and team-reviewed. Memory is auto-generated and personal. If the same fact keeps appearing in memory, promote it to CLAUDE.md so the whole team benefits. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Optimizing Context Budget and Scaling Up

Lean CLAUDE.md, self-describing code, hierarchical context, monorepo boundaries.

---

# The Lean CLAUDE.md

The **80/20 rule**: keep the 20% of instructions that prevent 80% of mistakes.

```markdown
# AFTER: Lean CLAUDE.md (~200 tokens)

## Commands
- Build: `pnpm build`
- Test: `pnpm vitest run`
- Lint: `pnpm eslint . --fix`
- Single test: `pnpm vitest run path/to/test`

## Critical Rules
- Use pnpm, never npm or yarn
- Named exports only, no default exports
- All API errors must use AppError from src/errors.ts
- Never modify files in src/generated/

## Architecture
Three-layer: API (src/api/) -> Services (src/services/)
-> Database (src/database/).
Each layer has a .ctx file with detailed patterns.
```

**Before:** 500 lines, ~8,000 tokens, 4% of window wasted.
**After:** 50 lines, ~800 tokens, 0.4% of window. **10x improvement.**

<!-- Speaker note: Walk through this example line by line. Every line earns its place by preventing a common mistake. The architecture section is three sentences because that is all the agent needs to route itself to the right directory. The details are in .ctx files, loaded on demand. -->

---

# Self-Describing Code and Pre-load vs. Discover

**Self-describing code** reduces context consumption by communicating intent through names and types:

```python
# Needs documentation: 4+ file reads to understand
def proc(d, f):
    r = []
    for i in d:
        if f(i):
            r.append(i)
    return r

# Self-documenting: zero extra context needed
def filter_active_users(
    users: list[User],
    is_active: Callable[[User], bool]
) -> list[User]:
    return [user for user in users if is_active(user)]
```

**Pre-load vs. Discover:**

| Pre-load (CLAUDE.md, Memory) | Discover (Search, .ctx) |
|---|---|
| Build and test commands | Module-specific patterns |
| Top 5 conventions | API endpoint examples |
| Security constraints | Full type definitions |

<!-- Speaker note: The naming example is dramatic but realistic. In a real codebase, every vague name like 'data', 'result', or 'handler' costs the agent extra reads to understand. Good names are free documentation. Types are even better because they are machine-verifiable. -->

---

# Hierarchical Context

Large codebases need **layered context** -- broad to specific.

<div class="mermaid">
graph TD
    A["Root CLAUDE.md\nGlobal rules, build commands,\narchitecture overview"]
    A --> B["packages/api/CLAUDE.md\nAPI conventions, middleware,\nendpoint patterns"]
    A --> C["packages/web/CLAUDE.md\nReact patterns, state mgmt,\ncomponent conventions"]
    A --> D["packages/shared/CLAUDE.md\nShared types, utility rules,\nversioning policy"]
    B --> B1["src/routes/.ctx"]
    B --> B2["src/middleware/.ctx"]
    C --> C1["src/components/.ctx"]
    C --> C2["src/hooks/.ctx"]
    D --> D1["src/types/.ctx"]
    style A fill:#e0f0ff,stroke:#0066cc
    style B fill:#daf2f2,stroke:#009999
    style C fill:#daf2f2,stroke:#009999
    style D fill:#daf2f2,stroke:#009999
</div>

An agent working on an API route sees root + API context. An agent on a React component sees root + web context. **Each session gets exactly what it needs.**

<!-- Speaker note: This mirrors how organizations already work. Each team owns their domain with autonomy over local conventions. Shared agreements live at the top. The agent's context loading naturally follows the same boundaries. -->

---

# Context Boundaries in Monorepos

Different packages have different conventions. Without explicit boundaries, agents mix them up.

**The problem:** an agent remembers "all endpoints return `{ data, meta }`" from the API package and applies that pattern to a React component.

**The fix:** state scope explicitly in every package CLAUDE.md.

```markdown
# packages/web/CLAUDE.md

## Scope
This is a Next.js frontend. Ignore conventions from @acme/api.

## Data Fetching
- Use React Query for all API calls
- API responses are unwrapped by apiClient -- components
  receive data directly, not wrapped objects
```

**Operational patterns at scale:**
- **Context review in PRs** -- "Does the .ctx file need updating?"
- **Context coverage metrics** -- track which directories have .ctx files
- **Context freshness CI** -- verify .ctx references point to files that exist
- **Session splitting** -- one session per package, not one session for everything

<!-- Speaker note: The CI freshness check is surprisingly valuable. A .ctx file that references auth-handler.ts when that file was renamed six months ago actively misleads the agent. A simple bash script in CI can catch these. Show the verify-ctx-files.sh example if time permits. -->

---

# The Context Management Maturity Model

| Stage | Description | Agent Experience |
|---|---|---|
| 1. No context | No CLAUDE.md, no .ctx files | Agent guesses everything |
| 2. Single CLAUDE.md | Root CLAUDE.md covers basics | <span class="vs-good">Big improvement</span> |
| 3. Distributed | .ctx files + nested CLAUDE.md | <span class="vs-good">On-demand context</span> |
| 4. Automated | Context kits + memory + CI checks | <span class="vs-good">Right context, always fresh</span> |
| 5. Context-aware | Self-describing code + thin docs | <span class="vs-good">Code IS the context</span> |

Most teams are at **Stage 2**. Getting to **Stage 3** is the biggest single leap in agent productivity.

<div class="callout">

**Action item:** Identify the three directories agents work in most often. Write .ctx files for those three. That is Stage 3.

</div>

<!-- Speaker note: Do not try to jump from Stage 1 to Stage 5. Each stage builds on the last. Stage 2 to Stage 3 is the highest-ROI move because it solves the bloated CLAUDE.md problem and gives agents on-demand access to relevant context. Most teams can get there in an afternoon. -->

---

# Key Takeaways

1. **Context is the #1 bottleneck** -- the agent's window is finite; every token must earn its place
2. **Distribute context with .ctx files** -- place documentation next to the code it describes
3. **Use memory to break the Groundhog Day cycle** -- persist discoveries, corrections, and project facts
4. **Keep CLAUDE.md lean** -- 50 lines of high-signal rules beats 500 lines of everything
5. **Make code self-describing** -- good names and types are free context
6. **Scale with hierarchy** -- root, package, directory layers match how teams already work
7. **Know when to start fresh** -- split sessions at package boundaries

> Treat context like a precious resource. Because for the agent, it is.

<!-- Speaker note: Encourage participants to audit their CLAUDE.md this week. Count the lines, estimate tokens, and ask for each line: does this prevent a common mistake in most sessions? If not, move it to a .ctx file or remove it entirely. That single exercise is worth more than any tool. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Thank You

## Context Management -- Module 8

Questions and discussion

Agent Ready Academy

<!-- Speaker note: Good discussion prompts: "What is the biggest context waste in your current project?" and "Where would you place your team on the maturity model?" These questions surface real problems that participants can fix immediately. -->
