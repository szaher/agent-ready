# Agent-Readiness Bootstrap Prompt

Use this prompt in any repository to create or improve its agent readiness. Paste it into a conversation with an AI coding agent and it will audit the README, create CLAUDE.md, AGENTS.md, and custom agent definitions.

---

**Make this repository agent-ready by auditing the README, creating CLAUDE.md, AGENTS.md, and custom agent definitions. Follow these steps exactly.**

## Step 0: Audit and update the README

Before creating agent configuration, ensure the README covers:

- **Project purpose** — one paragraph explaining what this project does and who it is for.
- **Prerequisites** — runtime versions, required tools, accounts, or API keys.
- **Setup steps** — clone → install → configure → run, as a numbered list with exact commands.
- **Build, test, and lint commands** — these must match what will go in CLAUDE.md.
- **How to contribute** — branch strategy, PR process, and any conventions (if applicable).

If the README is missing, outdated, or has broken setup instructions, fix it first. A CLAUDE.md that references commands not documented in the README signals a repo where neither humans nor agents can onboard reliably.

Run the setup steps yourself to verify they work from a clean state.

## Step 1: Explore the codebase

Before writing anything, investigate the repository thoroughly:

1. **Build system** — Find the package manager (npm, pnpm, yarn, pip, cargo, go, make), build commands, test framework, linter, and formatter. Run them to confirm they work.
2. **Language and framework** — Identify the primary language, framework, and runtime version. Check for strict type checking (tsconfig strict, mypy, etc.).
3. **Architecture** — Map the directory structure to 2-3 levels deep. Identify the data flow (e.g., request → handler → service → database).
4. **Code conventions** — Read 5-10 source files and observe: naming patterns (camelCase, snake_case, PascalCase), import style (absolute vs relative, barrel exports), export patterns (default vs named), component patterns, error handling, state management, test location and naming.
5. **Existing docs** — Read any README, CONTRIBUTING, existing CLAUDE.md, .cursorrules, or AGENTS.md.
6. **Git history** — Check recent commits for commit message style and active areas of development.
7. **CI/CD** — Check for GitHub Actions, GitLab CI, or other CI configuration.

## Step 2: Write CLAUDE.md

Create a root `CLAUDE.md` with these five sections **in this exact order** (most operationally critical first):

### Section 1: Build, Test, Lint (MOST CRITICAL — goes first)

```markdown
## Build, Test, Lint

\`\`\`bash
<exact install command>
<exact build command>
<exact test command — full suite>
<exact test command — single file variant>
<exact test command — pattern matching variant>
<exact lint command>
<exact type check command if separate from build>
\`\`\`

Run <test>, <lint>, and <build> before considering any task done.
```

Use the actual commands you discovered. Include single-file and pattern variants for the test runner. No vague descriptions — exact commands only.

### Section 2: Code Style

Document conventions that:

- Differ from language defaults.
- Are hard for agents to infer from code alone.
- Have caused mistakes in the past.

Cover: type strictness, import style, naming conventions (files, variables, types, constants), component/class patterns, styling approach, state management, test patterns. Use bullet points, not paragraphs.

### Section 3: Architecture

```markdown
## Architecture

\`\`\`
<annotated directory tree, 2-3 levels deep>
<each line has a brief annotation explaining purpose>
\`\`\`

Data flow: <source> → <processing> → <output>
```

### Section 4: Do's and Don'ts

Focus on "Do NOT" rules — these prevent specific failure modes. Include rationale for non-obvious rules. Format as a bullet list. Examples:

- Do NOT install packages without discussing first.
- Do NOT use raw SQL — use the ORM query builder. (Prevents SQL injection and maintains migration consistency.)
- Do NOT modify files in `<path>` when working on `<other path>`.

### Section 5: Brief reference to scoped guides (if applicable)

If the repo has distinct operational areas (e.g., frontend + backend, platform + content, multiple packages), add a one-line pointer to scoped CLAUDE.md files.

**Length target:** 60-100 lines for a typical web app. Under 40 for a small library. Every line consumes agent context tokens — include only what agents need to act correctly.

## Step 3: Create scoped CLAUDE.md files (if applicable)

If the repo has distinct areas with different conventions, create scoped instruction files in the relevant subdirectories. These are automatically loaded when agents work in those directories.

Use this for: monorepo packages, content directories, infrastructure directories, or any area with its own conventions that would bloat the root file.

## Step 4: Write AGENTS.md

Create a root `AGENTS.md` that describes:

1. The repo's operational modes (what kinds of work happen here).
2. Which custom agents are available and when to use each.
3. The permission model (who can read/write/execute what).
4. Any setup or sync procedures that agents should know.

Keep it under 50 lines. This is a routing document, not a full guide.

## Step 5: Create custom agent definitions

Create `.claude/agents/` with 2-4 agent definitions based on the actual workflows in this repo.

**Choose agents based on the repo's real workflows, not generic archetypes.** Ask: "What are the 2-3 distinct types of work that happen in this repo?" Each one may deserve a specialized agent.

Each agent file (`.claude/agents/<name>.md`) should have:

```markdown
# <Agent Display Name>

<One paragraph: what this agent is, what it does, what it cares about.>

## Before You Start

<Numbered list: what to read/check before acting. Reference specific files.>

## Your Workflow

<Numbered list: the step-by-step process this agent follows.>

## Rules

<Bullet list: behavioral rules specific to this agent's domain.>

## Constraints

<Bullet list: hard boundaries — files it must NOT touch, tools it must NOT use.
Format as NEVER statements for clarity.>
```

**Agent design principles:**

- Each agent should have the minimum permissions needed for its role (principle of least privilege).
- Separate "read-only" agents (reviewers, auditors) from "write" agents (implementers, authors).
- Constraints tell the agent what it SHOULD do. Tool permissions control what it CAN do. Use both.
- Keep each agent under 60 lines. If it is longer, it is doing too much — split it.
- Name files with kebab-case: `code-reviewer.md`, `test-writer.md`, `api-developer.md`.

**Common agent patterns** (pick what fits the repo):

| Pattern | Role | Permissions |
|---------|------|-------------|
| Code Reviewer | Analyze changes, report issues | Read-only |
| Test Writer | Create and update tests | Read all, write test files only |
| Feature Developer | Implement features in a specific area | Read all, write in scoped directories |
| Doc Maintainer | Update documentation | Read all, write docs only |
| Security Auditor | Find vulnerabilities | Read-only |
| Migration Helper | Update APIs or patterns across files | Read all, write with specific scope |

## Step 6: Verify

1. Confirm README setup instructions work from a clean state.
2. Confirm CLAUDE.md is under 100 lines.
3. Run the build, test, and lint commands listed in CLAUDE.md to verify they are correct.
4. Read each agent definition and verify the referenced files and paths actually exist.
5. Check that the do's and don'ts reflect actual conventions observed in the code, not generic advice.

## Quality checklist

Before finishing, verify every instruction in CLAUDE.md passes this test:

- **Actionable?** — The agent can do something specific with it.
- **Unambiguous?** — Only one interpretation possible.
- **Current?** — Reflects the codebase today, not how it used to be.
- **Necessary?** — The agent would make a mistake without it.
- **Concise?** — As few words as possible while remaining clear.

If an instruction fails any of these, rewrite or remove it.

## Maturity reference

After completing these steps, assess the repo against these levels:

| Level | Name | Key Indicator |
|-------|------|---------------|
| 0 | Unaware | No agent instruction file, setup requires tribal knowledge |
| 1 | Foundational | README with setup, working build/test/lint commands |
| 2 | Structured | CLAUDE.md with commands, conventions, architecture, and constraints |
| 3 | Optimized | Hierarchical instructions, scoped CLAUDE.md files, custom agents, step-by-step workflows |
| 4 | Autonomous | Agent performance tracking, self-healing instructions, end-to-end feature workflows |

Completing Steps 0-5 brings a repo from Level 0 to Level 2-3. Level 4 requires ongoing iteration based on real agent usage — each agent mistake reveals a missing instruction.
