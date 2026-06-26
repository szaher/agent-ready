---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'Workflows and CI/CD Integration'
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

# Workflows and CI/CD Integration

## From Ad-Hoc Prompts to Production Pipelines

Agent Ready Academy | Module 9

---

# Agenda

- Agent workflow patterns -- sequential, parallel, pipeline
- Running agents in CI/CD -- GitHub Actions, headless mode, API keys
- Automated code review -- multi-dimensional analysis on every PR
- Test-driven agent development -- humans write tests, agents implement
- Continuous agent improvement -- feedback loops and iterative refinement

<!-- Speaker note: This module bridges the gap between interactive agent use and production-grade automation. By the end, participants will have a blueprint for embedding agents into their existing CI/CD pipelines. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## Agent Workflow Patterns

Repeatable multi-step orchestrations that go beyond single prompts.

---

# Why Workflows Matter

A single prompt gets you a single action. Real engineering tasks require **orchestrated sequences** of actions with branching logic.

- **Repeatability** -- the same workflow produces consistent results every time
- **Composability** -- small, focused agent tasks chain into complex operations
- **Observability** -- each step logs its inputs, outputs, and decisions
- **Recoverability** -- failures at step N don't lose the work from steps 1 through N-1

> Moving from "ask the agent a question" to "run the agent as infrastructure" is the single biggest unlock for team-wide adoption.

<!-- Speaker note: The key mental shift here is treating agents like microservices rather than chat partners. Each workflow step has a defined input, output, and failure mode. -->

---

# Three Core Workflow Patterns

<div class="mermaid">
graph TD
    subgraph Sequential["Sequential Pipeline"]
        S1[Analyze Code] --> S2[Generate Fix]
        S2 --> S3[Run Tests]
        S3 --> S4[Create PR]
    end

    subgraph FanOut["Fan-Out / Fan-In"]
        F0[Distribute Tasks] --> F1[Agent A: Security]
        F0 --> F2[Agent B: Performance]
        F0 --> F3[Agent C: Style]
        F1 --> F4[Merge Results]
        F2 --> F4
        F3 --> F4
    end

    subgraph Router["Router / Conditional"]
        R1[Classify Input] --> R2{Type?}
        R2 -->|Bug| R3[Debug Workflow]
        R2 -->|Feature| R4[Implement Workflow]
        R2 -->|Refactor| R5[Refactor Workflow]
    end

    style Sequential fill:#ebf8ff,stroke:#3182ce
    style FanOut fill:#f0fff4,stroke:#38a169
    style Router fill:#fef0f0,stroke:#cc0000
</div>

<!-- Speaker note: These three patterns cover 90% of agent automation use cases. Sequential is the simplest -- each step feeds the next. Fan-out parallelizes independent work. Router selects a workflow based on input classification. You can nest these: a router might dispatch to a fan-out that feeds into a sequential pipeline. -->

---

# Choosing the Right Pattern

| Pattern | Best For | Latency | Complexity |
|---------|----------|---------|------------|
| **Sequential** | Dependent steps (analyze, then fix, then test) | <span class="vs-bad">High</span> | <span class="vs-good">Low</span> |
| **Fan-Out** | Independent analyses (security + perf + style) | <span class="vs-good">Low</span> | <span class="vs-neutral">Medium</span> |
| **Router** | Varied inputs needing different handling | <span class="vs-neutral">Medium</span> | <span class="vs-neutral">Medium</span> |
| **Pipeline + Fan-Out** | Complex multi-stage with parallel substeps | <span class="vs-neutral">Medium</span> | <span class="vs-bad">High</span> |

<div class="callout">

**Rule of thumb:** Start with sequential. Introduce fan-out only when latency matters. Add routing when you have distinct input categories that need different treatment.

</div>

<!-- Speaker note: Resist the temptation to over-engineer. A sequential three-step workflow that runs in CI is infinitely more valuable than a complex orchestration that never ships. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## CI/CD Integration

Running agents as first-class pipeline steps.

---

# Headless Agent Execution

Agents in CI/CD run without a human at the keyboard. This changes three things:

- **No interactive approval** -- every tool call must be pre-authorized or the run hangs
- **Deterministic prompts** -- no back-and-forth; the prompt must be complete on the first try
- **Exit code discipline** -- the agent must return 0 on success, non-zero on failure

```yaml
# Key flags for headless execution
claude --print           # Output-only mode, no interactive session
claude --dangerously-skip-permissions  # Pre-authorize all tool use
claude --output-format json           # Machine-parseable output
claude --max-turns 25                 # Prevent runaway loops
```

<div class="callout">

**Security note:** `--dangerously-skip-permissions` is safe in CI because the runner is ephemeral and sandboxed. Never use it on a developer workstation.

</div>

<!-- Speaker note: The --print flag is the most important one. It turns Claude Code from an interactive session into a Unix-style filter: input on stdin or via -p, output on stdout. This is what makes it composable with other CI tools. -->

---

# GitHub Actions Integration

```yaml
name: Agent Code Review
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  agent-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run agent review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(git diff origin/main...HEAD)
          claude --print -p "Review this diff for bugs, security
          issues, and performance problems. Output findings as
          a markdown list. Be specific about line numbers.

          $DIFF" > review.md

      - name: Post review comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const body = fs.readFileSync('review.md', 'utf8');
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: body
            });
```

<!-- Speaker note: Walk through each step. The fetch-depth 0 is critical -- without it, git diff can't compare against main. The API key is stored as a repository secret. The agent runs in print mode, writes its output to a file, and a separate step posts that file as a PR comment. This keeps the agent step and the GitHub API step cleanly separated. -->

---

# Secrets and Permission Management

Managing API keys and permissions safely across CI environments:

- **Repository secrets** -- store `ANTHROPIC_API_KEY` in GitHub Settings > Secrets
- **Environment scoping** -- restrict secrets to `production` or `staging` environments
- **Key rotation** -- rotate keys monthly; use short-lived keys when available
- **Cost controls** -- set `--max-turns` to cap token usage per run
- **Audit logging** -- persist agent output as build artifacts for post-run review

```yaml
      - name: Run agent with guardrails
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --print --max-turns 10 \
            --output-format json \
            -p "$PROMPT" | tee agent-output.json

      - uses: actions/upload-artifact@v4
        with:
          name: agent-output
          path: agent-output.json
```

<!-- Speaker note: Emphasize that agent runs consume tokens, and tokens cost money. Setting max-turns is your primary cost control. Uploading the output as an artifact means you can audit what the agent did even after the runner is destroyed. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## Automated Code Review

Multi-dimensional analysis on every pull request.

---

# Multi-Dimensional Review

A single reviewer catches some issues. An agent can run **multiple review passes in parallel**, each with a specialized lens:

<div class="mermaid">
graph LR
    PR[Pull Request Opened] --> D[Dispatch]
    D --> A1[Correctness Review]
    D --> A2[Security Review]
    D --> A3[Performance Review]
    D --> A4[Style & Convention Review]
    A1 --> M[Merge Findings]
    A2 --> M
    A3 --> M
    A4 --> M
    M --> C[Post Combined Comment]
    style A1 fill:#ebf8ff,stroke:#3182ce
    style A2 fill:#fef0f0,stroke:#cc0000
    style A3 fill:#fffff0,stroke:#d69e2e
    style A4 fill:#f0fff4,stroke:#38a169
</div>

Each review dimension uses a **different system prompt** tuned to its specialty. The fan-out pattern runs all four in parallel, then a merge step deduplicates and formats the combined report.

<!-- Speaker note: This is the fan-out pattern from Part 1 applied to code review. Each agent gets the same diff but a different system prompt. The security reviewer looks for injection, auth bypass, secrets in code. The performance reviewer looks for N+1 queries, unnecessary allocations, missing caching. Running them in parallel means the total time is the time of the slowest reviewer, not the sum of all four. -->

---

# Review Prompt Engineering

The quality of automated review depends entirely on the prompt. Vague prompts produce vague feedback.

**Bad prompt:**
> Review this code for issues.

**Good prompt:**
> You are reviewing a pull request to a Python Django application. Examine the diff for:
> 1. SQL injection via raw queries or unsanitized `.extra()` calls
> 2. Missing authentication decorators on new view functions
> 3. N+1 query patterns in loops that access related models
> 4. Exception handlers that silently swallow errors
>
> For each finding, state: the file and line number, the specific risk, and a concrete fix. If no issues are found for a category, say so explicitly.

<div class="callout">

**Key principle:** Tell the agent what to look for, what stack you are running, and what format to produce. Specificity eliminates noise.

</div>

<!-- Speaker note: The difference between bad and good prompts is the difference between "LGTM" and actionable findings. Notice the good prompt names exact anti-patterns, specifies the tech stack, and defines the output format. This is prompt engineering applied to a production context. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Test-Driven Agent Development

Humans define intent through tests. Agents implement to pass them.

---

# The TDD-Agent Loop

Traditional TDD: write a test, write code, refactor. Agent-assisted TDD: **write a test, let the agent write the code**, review the result.

1. **Human writes a failing test** -- this encodes the specification
2. **Agent implements** -- given the test, produce code that makes it pass
3. **Tests verify** -- the CI pipeline runs the full test suite
4. **Human reviews** -- the implementation is correct by construction; review focuses on design quality

> Tests are the most unambiguous specification language. When you give an agent a failing test instead of a prose description, hallucination has nowhere to hide.

<!-- Speaker note: This is a powerful inversion. Instead of reviewing agent code to see if it does the right thing, you define the right thing up front and the agent's job is purely mechanical -- make the tests green. The human's creative energy goes into test design, which is higher-leverage work. -->

---

# TDD-Agent Workflow in Practice

<div class="mermaid">
sequenceDiagram
    participant H as Human
    participant R as Repository
    participant A as Agent (CI)
    participant T as Test Suite

    H->>R: Push failing test on feature branch
    R->>A: CI triggers agent run
    A->>R: Agent reads test, writes implementation
    A->>T: Agent runs tests locally
    T-->>A: Tests pass
    A->>R: Agent commits and pushes
    R->>T: CI runs full test suite
    T-->>R: All green
    R->>H: PR ready for review
    H->>R: Human reviews design, merges
</div>

<!-- Speaker note: Walk through the sequence. The human's only job is to write the test and review the PR at the end. Everything in between is automated. The agent runs tests locally before pushing to catch obvious failures early. The CI pipeline then runs the full suite as a second check. This workflow works particularly well for well-defined functions, API endpoints, and data transformations where the input-output contract is clear. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 5

## Continuous Agent Improvement

Feedback loops that make your agent workflows better over time.

---

# The Improvement Flywheel

Agent performance is not static. Every run produces data you can use to improve the next run.

- **Review transcripts** -- read what the agent actually did, not just its final output
- **Identify failure modes** -- categorize where the agent went wrong (wrong file, wrong pattern, hallucinated API)
- **Update CLAUDE.md** -- add rules that prevent recurring mistakes
- **Refine prompts** -- tighten workflow prompts based on observed failure categories
- **Measure over time** -- track pass rate, review comment quality, human override rate

<div class="callout">

**The flywheel:** More runs produce more data. More data reveals more patterns. More patterns yield better prompts. Better prompts produce better runs.

</div>

<!-- Speaker note: This is where teams that treat agents as infrastructure pull ahead. The teams that just run agents and hope for the best plateau quickly. The teams that instrument, review, and iterate see compounding improvements. The CLAUDE.md file is the primary lever -- every rule you add based on observed failures prevents an entire class of future mistakes. -->

---

# Updating CLAUDE.md from CI Feedback

A practical loop for iterative improvement:

1. **Collect** -- save agent transcripts from CI runs as build artifacts
2. **Triage** -- weekly, review failures and near-misses
3. **Classify** -- group issues: wrong conventions, missing context, hallucinated APIs, scope creep
4. **Codify** -- add specific rules to CLAUDE.md for each category
5. **Verify** -- re-run the failed prompts and confirm the new rules prevent the issue

```markdown
# Example CLAUDE.md additions after CI review

## Anti-Patterns (added 2026-06-09 from CI failure analysis)
- Do NOT use `datetime.now()` -- always use `django.utils.timezone.now()`
- Do NOT create migration files -- only modify models, humans run makemigrations
- When fixing a test, never delete the test -- fix the implementation instead
- All new API endpoints must include OpenAPI docstrings
```

<!-- Speaker note: The date stamp is important -- it turns CLAUDE.md into a living document with a changelog. When a rule stops being relevant, you can see when it was added and why, making it safe to remove. Treat CLAUDE.md updates like production config changes: review them in PRs, not as drive-by edits. -->

---

# Key Takeaways

1. **Structure agent work as workflows** -- sequential, fan-out, and router patterns cover most automation needs
2. **Run agents in CI with guardrails** -- headless mode, max-turns, artifact logging
3. **Fan out code review** -- parallel specialized passes catch more than a single generic review
4. **Let tests be the spec** -- TDD with agents eliminates ambiguity and makes verification automatic
5. **Close the loop** -- review transcripts, update CLAUDE.md, measure improvement over time

> The goal is not to replace human judgment. It is to ensure human judgment is applied to design decisions, not mechanical implementation.

<!-- Speaker note: Recap each point briefly. The overarching theme is that agents become dramatically more valuable when embedded in repeatable workflows with feedback loops. Ad-hoc prompting is where you start. CI-integrated workflows with continuous improvement is where you want to end up. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Now Build Your Pipeline

## Start with one workflow. Measure. Iterate.

Agent Ready Academy | Module 9

<!-- Speaker note: Challenge the audience to pick one workflow from this module -- code review is the easiest starting point -- and have it running in their CI pipeline by end of week. Offer to review their GitHub Actions YAML in office hours. -->
