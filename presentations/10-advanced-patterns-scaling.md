---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'Advanced Patterns and Scaling'
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

# Advanced Patterns and Scaling

## From One Developer to the Entire Organization

Agent Ready Academy | Module 10

<!-- Speaker note: This is the capstone module. We tie together everything from Modules 1-9 and look at how to scale agent-ready practices across teams, troubleshoot failures, secure repositories, optimize performance, and anticipate the future of the ecosystem. -->

---

# Agenda

- **Team adoption** -- champion, pilot, CI integration, org-wide standards
- **Troubleshooting** -- systematic diagnostics and reading transcripts
- **Security audit** -- six domains every agent-ready repo must cover
- **Performance optimization** -- lean CLAUDE.md, search-first, batching, right-sizing
- **The future** -- persistent memory, multi-agent collaboration, automated CLAUDE.md

> Module 10 is where individual skill becomes organizational capability.

<!-- Speaker note: We have five sections, each one mapping to a lesson in the module. The thread that connects them: everything you learned in Modules 1-9 only matters at scale if you can get your team to adopt it, keep it secure, keep it fast, and stay ahead of the curve. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## Team Adoption Strategies

How to go from one champion to an org-wide standard.

---

# The Four-Stage Adoption Model

<div class="mermaid">
graph LR
    S1["Stage 1\nChampion"] --> S2["Stage 2\nTeam Pilot"]
    S2 --> S3["Stage 3\nCI Integration"]
    S3 --> S4["Stage 4\nOrg-Wide\nStandard"]
    S1 --- D1["One dev produces\nevidence on real work"]
    S2 --- D2["Team shares CLAUDE.md\nand reviews agent PRs"]
    S3 --- D3["Agents run in CI\nwith hooks and gates"]
    S4 --- D4["Template repo, docs,\nsupport channel, governance"]
    style S1 fill:#c6f6d5,stroke:#38a169
    style S2 fill:#e0f0ff,stroke:#0066cc
    style S3 fill:#fefcbf,stroke:#d69e2e
    style S4 fill:#e9d8fd,stroke:#805ad5
</div>

<!-- Speaker note: Each stage builds evidence that justifies the next. The critical mistake is jumping to Stage 4 -- mandating org-wide standards -- before any team has produced evidence that the practices work. Start with one developer who shows, not tells. -->

---

# Adoption Anti-Patterns

- **Top-Down Mandate** -- developers resist imposed tools without understanding why
- **Passive Awareness** -- a Slack message generates interest but no action
- **Perfectionist Delay** -- debating the perfect CLAUDE.md template instead of shipping
- **The Demo Loop** -- impressive demos without follow-up process changes
- **Measuring Lines of Code** -- incentivizes volume over quality

<div class="callout">

**Key insight:** Adoption is a change management challenge, not a technical one. Show value before asking for commitment.

</div>

<!-- Speaker note: Ask the audience which of these they have seen at their org. The most common is perfectionist delay -- teams that agree agents are valuable but never actually start using them because they are waiting for the perfect setup. -->

---

# Measuring Adoption Success

| Metric | What It Tells You | When to Worry |
|--------|-------------------|---------------|
| Developer satisfaction | Whether agents help or hinder | Score drops below neutral |
| Tasks completed by agents | Concrete value delivered | Count plateaus or drops |
| Code review velocity | Whether agent PRs are reviewable | Agent PRs slower than human PRs |
| Agent success rate | CLAUDE.md and tooling quality | Below 60% usable output |

> Avoid measuring "percentage of code written by agents" -- that incentivizes quantity over quality.

<!-- Speaker note: Developer satisfaction is the leading indicator. If developers are frustrated, no amount of task completion metrics will sustain adoption. Survey the team quarterly with simple questions: "Do agents reduce tedium? Do you feel more productive?" -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## Troubleshooting Agent Issues

When things go wrong -- and they will -- follow a system.

---

# The Diagnostic Flowchart

<div class="mermaid">
graph TD
    Start["Agent produced\nunexpected output"] --> Step1["Review the transcript"]
    Step1 --> Q1{"Read the\nright files?"}
    Q1 -->|No| Fix1["Update CLAUDE.md\nwith file pointers"]
    Q1 -->|Yes| Q2{"Followed\ninstructions?"}
    Q2 -->|No| Fix2["Rewrite vague or\nconflicting rules"]
    Q2 -->|Yes| Q3{"Enough\ncontext?"}
    Q3 -->|No| Fix3["Split task or\nreduce context load"]
    Q3 -->|Yes| Q4{"Well-scoped\ntask?"}
    Q4 -->|No| Fix4["Break into\nsmaller tasks"]
    Q4 -->|Yes| Fix5["Model limit --\ntry different approach"]
    style Start fill:#fef0f0,stroke:#cc0000
    style Fix1 fill:#daf2f2,stroke:#009999
    style Fix2 fill:#daf2f2,stroke:#009999
    style Fix3 fill:#daf2f2,stroke:#009999
    style Fix4 fill:#daf2f2,stroke:#009999
    style Fix5 fill:#fefcbf,stroke:#d69e2e
</div>

<!-- Speaker note: Walk through each decision node. The most common root cause is "did not read the right files" -- meaning the CLAUDE.md lacks file pointers. The second most common is ambiguous instructions. True model limits are rare when the task is properly scoped. -->

---

# The Five Most Common Failures

1. **Agent ignores instructions** -- CLAUDE.md is too long; critical rules are buried past line 200
2. **Agent edits wrong files** -- directory structure is ambiguous; no explicit off-limits list
3. **Agent loops without progress** -- ambiguous success criteria; no guidance to break dead ends
4. **Context overflow** -- session too long; agent "forgets" earlier conventions
5. **Semantically wrong code** -- compiles fine but behavior is incorrect; missing domain context

<div class="callout">

**Tip:** Build a failure library. Record each significant failure, its root cause, and the fix. Over months, it becomes your team's diagnostic reference.

</div>

<!-- Speaker note: The failure library is one of the highest-value artifacts a team can maintain. Each entry is a permanent improvement. New team members use it to solve known problems in minutes instead of hours. -->

---

# Reading Transcripts Effectively

```markdown
## Transcript Analysis Checklist

1. Scan the TOOL CALL SEQUENCE first (not the content)
   - Read file X → Read file Y → Edit file Z → Run tests
   - Does this sequence make sense for the task?

2. Find the PIVOT POINT
   - The exact moment output went from reasonable to wrong
   - The tool call immediately before = most diagnostic

3. Compare SUCCESSFUL vs FAILED sessions
   - Same task type, different outcomes
   - What contextual factor changed?

4. Check ERROR RECOVERY
   - Did the agent handle build/test failures well?
   - Poor recovery = error messages are not informative enough
```

<!-- Speaker note: The pivot point technique is the most useful. Instead of reading the entire transcript, find where things went wrong and focus on the tool call that triggered the divergence. That one call usually reveals the root cause. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## Security Audit

Six domains. No shortcuts.

---

# The Six Security Domains

| Domain | Key Risk | Critical Control |
|--------|----------|-----------------|
| Secrets Management | Agent leaks keys into code or logs | `.env` in `.gitignore` + CLAUDE.md forbids reading secrets |
| Branch Protection | Agent pushes directly to main | Require PR reviews + pre-push hook |
| Permissions & Sandboxing | Agent runs arbitrary commands | Least privilege + allowlisted commands |
| Hook Coverage | Agent bypasses safety checks | Hooks in CI, not just local + no `--no-verify` |
| MCP Server Security | Unauthenticated tool access | Auth per server + scoped permissions |
| Audit Trails | Cannot determine what agent did | Co-author tags + session logs + retention |

<!-- Speaker note: Walk through each domain briefly. The most commonly missed domain is MCP server security -- teams add MCP integrations for convenience without auditing the permissions. The second most missed is audit trails -- if you cannot trace what an agent did, you cannot investigate incidents. -->

---

# Agent Permissions: Least Privilege in Practice

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(npm test:*)"
    ],
    "deny": [
      "Write",
      "Edit",
      "Bash(rm:*)",
      "Bash(curl:*)",
      "Bash(wget:*)"
    ]
  }
}
```

- **Review-only agents** get read access and test execution -- no writes
- **Writing agents** get scoped write access to specific directories
- **No agent** gets unrestricted network or file system access

<!-- Speaker note: This is a real .claude/settings.json configuration for a review-only agent. The key principle: every agent starts with zero permissions and adds only what is necessary. An agent that reviews code does not need to write files. An agent that writes tests does not need network access. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Performance Optimization

Faster. More accurate. Less expensive.

---

# The Optimization Stack

- **1. Lean CLAUDE.md** -- under 60 lines in root, details in sub-directory files
- **2. Search-first access** -- grep before reading; 50 tokens vs 1,200 tokens
- **3. Batch related tasks** -- one session per coherent change, not per file
- **4. Right-size models** -- Opus for architecture, Haiku for lint fixes
- **5. Fast feedback loops** -- targeted tests, incremental builds
- **6. Focused sessions** -- one task, clear success criteria, fresh context

> Most optimizations improve all three dimensions simultaneously: speed, accuracy, and cost.

<!-- Speaker note: The single highest-impact optimization is #1. A lean CLAUDE.md that points the agent to the right files immediately makes it faster (less searching), more accurate (more relevant context), and cheaper (fewer tokens wasted on irrelevant files). -->

---

# Right-Sizing Models

| Task Type | Model Tier | Rationale |
|-----------|-----------|-----------|
| Complex refactoring | Most capable (Opus) | Architecture understanding + coordinated changes |
| Feature implementation | Most capable (Opus) | Design intent + novel logic |
| Writing tests | Mid-tier (Sonnet) | Clear pattern: read function, write test |
| Formatting / lint fixes | Smallest viable (Haiku) | Mechanical transforms with explicit rules |
| Boilerplate generation | Mid-tier (Sonnet) | Template following with minor adaptation |

```bash
# Complex task -- most capable model
claude --model opus "Refactor the payment service to use
  the new event-driven architecture in docs/adr-007.md"

# Simple task -- faster, cheaper model
claude --model haiku "Fix all ESLint errors in src/utils/"
```

<!-- Speaker note: The common mistake is defaulting to the cheapest model to save money. An underpowered model that fails three times costs more than a capable model that succeeds once. Right-sizing means matching the model to the task, not minimizing the model. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 5

## The Future of Agent-Ready

Where the ecosystem is heading -- and what stays constant.

---

# From Stateless to Persistent Memory

<div class="mermaid">
graph TD
    subgraph Today["Today: Stateless"]
        T1["Session 1:\nRead CLAUDE.md\nRead 12 files\nMake changes"] --> T2["Session 2:\nRead CLAUDE.md\nRead 12 files again"]
        T2 --> T3["Session 3:\nRead CLAUDE.md\nRead 12 files again"]
    end
    subgraph Future["Future: Persistent Memory"]
        F1["Session 1:\nBuild codebase model"] --> FM["Codebase\nMemory"]
        FM --> F2["Session 2:\nConsult memory\nRead 2 changed files"]
        F2 --> FM
        FM --> F3["Session 3:\nConsult memory\nRead 1 changed file"]
        F3 --> FM
    end
    style Today fill:#fef0f0,stroke:#cc0000
    style Future fill:#daf2f2,stroke:#009999
    style FM fill:#e0f0ff,stroke:#0066cc
</div>

<!-- Speaker note: The CLAUDE.md you write today becomes the seed for persistent memory systems. Agents will build on your documentation rather than replace it. The investment in clear, structured instructions pays even larger dividends when those instructions feed a system that remembers across sessions. -->

---

# Multi-Agent Collaboration and Beyond

**Emerging patterns that build on everything you have learned:**

- **Multi-agent pipelines** -- dev agent hands off to review agent, then test agent, then CI
- **Shared team memory** -- one developer's agent learns a pattern, every agent benefits
- **Automated CLAUDE.md generation** -- agents analyze your codebase and propose instruction updates
- **Agents beyond code** -- design review, issue triage, incident response, documentation sync

<div class="callout">

**What will NOT change:** Clarity wins. Automation compounds. Constraints enable trust. Measurement drives improvement. These principles endure regardless of tooling.

</div>

<!-- Speaker note: The specialized agent patterns from Module 4 -- role separation, focused permissions, role-specific instructions -- are the building blocks of multi-agent systems. Teams that have defined clear agent roles today will transition to multi-agent workflows naturally. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Course Complete

## The Agent-Ready Journey: All 10 Modules

**Know Why** -- Modules 1-2: The agentic shift and how agents work
**Know How** -- Modules 3-4: CLAUDE.md and custom agents
**Build Right** -- Modules 5-6: Project structure and CI integration
**Automate** -- Modules 7-8: MCP, hooks, and workflow automation
**Scale** -- Modules 9-10: Migration, security, and team adoption

> Start today. Pick one repo. Write a CLAUDE.md. Use an agent for one real task. Measure. Refine. Share what you learn. You are the champion.

Agent Ready Academy

<!-- Speaker note: End with this call to action. The entire academy has been building toward this moment: the audience now has the knowledge to make any codebase agent-ready. The only remaining step is to do it. Remind them that the practices they have learned -- clear documentation, structured projects, automated checks -- make the codebase better for humans too. There is no downside scenario. -->
