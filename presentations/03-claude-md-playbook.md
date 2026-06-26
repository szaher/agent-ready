---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'CLAUDE.md — Your Agent''s Playbook'
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

# CLAUDE.md -- Your Agent's Playbook

## Turning Cold-Start Chaos into First-Prompt Precision

Agent Ready Academy | Module 3

---

# Agenda

- The cold-start problem and why CLAUDE.md matters
- Anatomy of a CLAUDE.md -- the five essential sections
- Writing effective instructions -- specificity, tone, anti-patterns
- Scoping instructions -- project, user, and global levels
- Real-world patterns -- annotated examples across stacks
- Hands-on takeaways

<!-- Speaker note: This deck covers the single highest-impact file you can add to make a codebase agent-ready. By the end, participants will be able to write one from scratch. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## The Cold-Start Problem

Why agents fumble on first contact with your repo.

---

# What Happens Without CLAUDE.md

Every time an agent opens your repo for the first time, it faces a **cold start**:

- **No build commands** -- guesses `npm start` when your project uses `make run`
- **No style rules** -- produces camelCase in a snake_case codebase
- **No architecture map** -- puts new code in the wrong directory
- **No guardrails** -- modifies generated files or checked-in binaries

> The agent is capable. It just lacks the context that humans absorb from onboarding, code review, and team norms.

<!-- Speaker note: Ask the audience how many have had an agent create a file in the wrong place or use the wrong test runner. Nearly everyone will raise a hand. This motivates the entire module. -->

---

# The Highest-Impact File

CLAUDE.md eliminates the cold-start problem in **one file**.

<div class="mermaid">
graph LR
    A[Agent Opens Repo] --> B{CLAUDE.md present?}
    B -->|No| C[Guess conventions]
    C --> D[Wrong patterns]
    D --> E[Human fixes output]
    B -->|Yes| F[Read CLAUDE.md]
    F --> G[Correct from first prompt]
    G --> H[Productive session]
    style C fill:#fef0f0,stroke:#cc0000
    style D fill:#fef0f0,stroke:#cc0000
    style F fill:#e0f0ff,stroke:#0066cc
    style G fill:#e0f0ff,stroke:#0066cc
    style H fill:#daf2f2,stroke:#009999
</div>

Think of CLAUDE.md as **onboarding docs written for an agent** -- concise, imperative, and machine-readable.

<!-- Speaker note: Emphasize that this is not about dumbing things down. It is about being explicit where humans rely on implicit norms. The agent reads this file automatically before every session. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## Anatomy of a CLAUDE.md

The five sections every CLAUDE.md needs.

---

# The Five Sections

<div class="mermaid">
graph TD
    A[CLAUDE.md] --> B["1. Commands"]
    A --> C["2. Code Style"]
    A --> D["3. Architecture"]
    A --> E["4. Do's and Don'ts"]
    A --> F["5. File Structure"]
    B --> B1["Build, test, lint, deploy"]
    C --> C1["Naming, formatting, patterns"]
    D --> D1["Layers, boundaries, data flow"]
    E --> E1["Guardrails and constraints"]
    F --> F1["Where things live"]
    style A fill:#e0f0ff,stroke:#0066cc
    style B fill:#daf2f2,stroke:#009999
    style C fill:#daf2f2,stroke:#009999
    style D fill:#daf2f2,stroke:#009999
    style E fill:#daf2f2,stroke:#009999
    style F fill:#daf2f2,stroke:#009999
</div>

Each section answers a different class of question the agent will have. Order matters -- commands first, structure last.

<!-- Speaker note: Walk through each branch. Explain that the order reflects priority: the agent needs to know how to build and test before it needs to know file layout. -->

---

# Section 1: Commands

Tell the agent **exactly** how to build, test, lint, and run your project.

```markdown
# Commands

- Build: `pnpm build`
- Test all: `pnpm test`
- Test single: `pnpm test -- --grep "test name"`
- Lint: `pnpm lint --fix`
- Dev server: `pnpm dev` (port 3000)
- DB migrations: `pnpm db:migrate`
- Type check: `pnpm tsc --noEmit`
```

<div class="callout">

**Tip:** Include the single-test command. Agents run individual tests constantly during development, and guessing the flag syntax wastes tokens and time.

</div>

<!-- Speaker note: The single-test command is the most commonly missing instruction. Every framework has a different flag: --grep, --testPathPattern, -run, -k. Spell it out. -->

---

# Section 2: Code Style

Declare naming conventions, formatting rules, and preferred patterns.

```markdown
# Code Style

- Use snake_case for functions and variables.
- Use PascalCase for classes and type aliases.
- Prefer f-strings over .format() or % formatting.
- Use pathlib.Path instead of os.path for all file operations.
- Maximum function length: 40 lines. Extract helpers.
- All public functions must have docstrings (Google style).
- Imports: stdlib first, third-party second, local third.
  Separate each group with a blank line.
```

> Only document conventions that **differ from language defaults** or that the agent would not infer from existing code.

<!-- Speaker note: Do not restate PEP 8. The agent already knows PEP 8. Focus on your team's specific conventions that override or extend the defaults. -->

---

# Section 3: Architecture

Describe layers, boundaries, and data flow so the agent places code correctly.

```markdown
# Architecture

Three-layer architecture:
- `src/api/` -- FastAPI route handlers. Thin layer, no business logic.
- `src/services/` -- Business logic. All DB access goes through repositories.
- `src/repositories/` -- SQLAlchemy queries. One file per domain entity.

Data flows: Handler -> Service -> Repository -> Database.
Never skip a layer. Handlers must not import repositories directly.

The `src/models/` directory contains Pydantic schemas (request/response)
and SQLAlchemy ORM models. Keep them in separate files.
```

<!-- Speaker note: The key phrase is "never skip a layer." Without this instruction, agents will happily put a database query inside a route handler because it is shorter. Explicit boundaries prevent architectural drift. -->

---

# Sections 4 and 5: Guardrails and Structure

**Do's and Don'ts** -- hard constraints that prevent costly mistakes:

```markdown
# Do's and Don'ts

- DO NOT modify any file under `generated/` -- these are auto-generated.
- DO NOT add dependencies without checking for existing alternatives.
- DO NOT use print() for logging -- use the `structlog` logger.
- DO run `pnpm lint --fix` before considering any task complete.
- DO add type hints to every new function signature.
```

**File Structure** -- where to put new files:

```markdown
# File Structure

- New API routes go in `src/api/v2/` (v1 is frozen).
- Test files mirror source: `src/services/foo.py` -> `tests/services/test_foo.py`.
- Migrations go in `alembic/versions/`. Use `alembic revision --autogenerate`.
```

<!-- Speaker note: The Don'ts section is where you encode lessons learned the hard way. Every time an agent makes a mistake that costs you time, add it here. This list will grow over time and that is fine. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## Writing Effective Instructions

How to write rules the agent actually follows.

---

# Specificity and Imperative Mood

| Weak Instruction | Strong Instruction |
|---|---|
| "We usually use pytest" | "Run tests with `pytest -xvs`" |
| "Try to keep functions small" | "Maximum function length: 40 lines" |
| "We prefer composition" | "DO NOT use class inheritance. Use composition with Protocol types" |
| "Be careful with the DB" | "All DB writes require a transaction context manager" |
| "Tests are important" | "Every new function in `src/services/` must have a corresponding test" |

<div class="callout">

**Rule of thumb:** If a human reviewer would send it back in code review, write it as an imperative instruction in CLAUDE.md.

</div>

<!-- Speaker note: Walk through the table column by column. Point out the pattern: vague preference becomes specific, measurable, enforceable. The agent cannot follow vibes. It can follow rules. -->

---

# Anti-Patterns to Avoid

Do not include these in your CLAUDE.md:

- **Obvious language rules** -- "use semicolons in JavaScript" (the agent already knows)
- **Entire style guides** -- linking to a 50-page document adds noise, not signal
- **Explanations without instructions** -- "Our architecture evolved from monolith to microservices" (interesting, not actionable)
- **Contradictory rules** -- "Keep functions short" and "Avoid creating too many files"
- **Stale instructions** -- referencing removed tools or deprecated patterns

> Every line in CLAUDE.md costs attention. Treat it like production code: review it, prune it, keep it current.

<!-- Speaker note: The most common anti-pattern is copy-pasting an entire style guide. The agent already knows most language conventions. Focus on the 10-20 rules that are specific to your project. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Scoping Instructions

Project vs. user vs. global, and nested CLAUDE.md for monorepos.

---

# Three Levels of Scope

Instructions load from three locations, merged in priority order:

| Level | Location | Applies To | Use Case |
|---|---|---|---|
| **Project** | `CLAUDE.md` in repo root | Everyone on this repo | Build commands, architecture, style |
| **User** | `.claude/settings.json` | Just you, this repo | Personal workflow preferences |
| **Global** | `~/.claude/CLAUDE.md` | All your repos | Cross-project conventions |

<div class="callout">

**Key:** Project-level instructions override global. More specific always wins. This means your team's CLAUDE.md takes precedence over any personal defaults.

</div>

<!-- Speaker note: The important takeaway is that project-level CLAUDE.md is checked into version control and shared with the team. User and global settings are personal and not committed. This mirrors how .editorconfig and .eslintrc work. -->

---

# Nested CLAUDE.md for Monorepos

In a monorepo, place a root CLAUDE.md for shared rules and subdirectory CLAUDE.md files for package-specific rules.

```
monorepo/
  CLAUDE.md                  <- Shared: CI commands, PR conventions
  packages/
    frontend/
      CLAUDE.md              <- React rules, component patterns
    backend/
      CLAUDE.md              <- Go rules, API conventions
    shared/
      CLAUDE.md              <- "DO NOT add package-specific logic here"
```

The agent merges all CLAUDE.md files from the root down to the current working directory. Deeper files add to or override shallower ones.

<!-- Speaker note: This is powerful for large teams. The frontend team maintains their own CLAUDE.md independently from the backend team. Changes to one do not require the other team's review. Show how this maps to CODEOWNERS if the audience uses GitHub. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 5

## Real-World Patterns

Annotated examples from production repositories.

---

# Pattern: Python ML Project

```markdown
# Commands
- Install: `pip install -e ".[dev]"` (always editable mode)
- Test: `pytest -xvs tests/`
- Single test: `pytest -xvs tests/test_model.py -k "test_name"`
- Lint: `ruff check --fix . && ruff format .`

# Code Style
- Type-hint every function. Use `from __future__ import annotations`.
- Use `pathlib.Path` for all file I/O. Never `os.path`.
- Dataclasses for config. Pydantic for external data validation.

# Do's and Don'ts
- DO NOT commit notebooks with cell outputs. Run `nbstripout` first.
- DO NOT add model weights to git. Use DVC or store in GCS.
- DO NOT use global variables for configuration. Pass Config objects.
```

<!-- Speaker note: The notebook and model-weight rules are critical. Without them, agents will happily commit a 500MB model checkpoint or a notebook with outputs that bloats the diff. These are the kind of project-specific traps that CLAUDE.md exists to prevent. -->

---

# Pattern: React + TypeScript App

```markdown
# Commands
- Dev: `pnpm dev` | Test: `pnpm vitest run`
- Single test: `pnpm vitest run src/components/Button.test.tsx`

# Code Style
- Functional components only. No class components.
- Use `interface` for component props, `type` for unions and utilities.
- Co-locate tests: `Button.tsx` -> `Button.test.tsx` (same directory).
- CSS modules for styling. No inline styles, no styled-components.

# Architecture
- `src/features/` -- feature modules (auth/, dashboard/, settings/)
- Each feature: `components/`, `hooks/`, `api/`, `types/`
- Shared UI primitives live in `src/components/ui/`. Do not duplicate.

# Don'ts
- DO NOT use `any`. Use `unknown` and narrow with type guards.
- DO NOT add `useEffect` for derived state. Use `useMemo` instead.
- DO NOT import from another feature's internals. Use the feature's index.
```

<!-- Speaker note: The "do not import across feature boundaries" rule is one that agents violate constantly without explicit instruction. They see a useful utility in another feature and import it directly, creating hidden coupling. The CLAUDE.md makes the boundary explicit. -->

---

# Summary

## What We Covered

- **Cold start** -- without CLAUDE.md, agents guess and guess wrong
- **Five sections** -- commands, code style, architecture, do's/don'ts, file structure
- **Writing style** -- specific, imperative, pruned, no obvious rules
- **Scoping** -- project, user, and global levels merge in priority order
- **Monorepos** -- nested CLAUDE.md files for per-package rules
- **Real patterns** -- concrete examples you can adapt today

## Your Action Item

Write a CLAUDE.md for one of your repositories this week. Start with **commands** and **don'ts** -- those two sections alone eliminate most cold-start problems.

<!-- Speaker note: Challenge participants to write a CLAUDE.md for their most active repository before the next session. Even a minimal one with just commands and three don'ts will improve agent collaboration significantly. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Questions?

## Thank you for attending

Agent Ready Academy -- Module 3
