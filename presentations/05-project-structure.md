---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'Project Structure for Agents'
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

# Project Structure for Agents

## Designing Codebases That AI Agents Can Navigate

Agent Ready Academy | Module 5

<!-- Title slide. This module bridges the gap between human-readable projects and agent-navigable projects. -->

---

# Agenda

- Why structure matters for agent success
- File organization patterns compared
- Naming conventions that aid discovery
- Documentation as navigational context
- Monorepos and large codebase strategies
- Practical guidelines and takeaways

<!-- Speaker note: This deck covers the structural decisions that determine whether an agent can understand your project in seconds or struggles for minutes. Frame every topic through the lens of agent comprehension. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## Why Structure Matters

How project layout directly impacts agent comprehension and task success rate.

<!-- Section divider for the opening motivation section. -->

---

# The Agent's First 10 Seconds

When an agent enters your codebase, it performs a rapid orientation:

- **Scan the root** -- look for README, config files, entry points
- **Read the tree** -- infer architecture from directory names
- **Locate targets** -- find the files relevant to the current task
- **Build a mental model** -- decide how components relate

> A well-structured project lets agents build an accurate mental model in one pass. A poorly structured project forces repeated, expensive exploration.

<div class="callout">

**Key insight:** Agents are not slower readers -- they are *lossy* readers. Structure is the compression algorithm that preserves meaning.

</div>

<!-- Speaker note: Emphasize that agents have finite context windows. Every wasted token on orientation is a token not spent on the actual task. Poor structure doesn't just slow agents down -- it causes them to form incorrect models and produce wrong output. -->

---

# Structure vs. Success Rate

<div class="mermaid">
graph LR
    A[Agent Receives Task] --> B{Can it locate<br/>relevant files?}
    B -->|Yes, quickly| C[Builds accurate model]
    B -->|No, must search| D[Burns context on exploration]
    C --> E[High-quality output]
    D --> F{Finds files<br/>eventually?}
    F -->|Yes| G[Partial model, mediocre output]
    F -->|No| H[Hallucination or failure]
    style C fill:#c6f6d5,stroke:#2f855a
    style E fill:#c6f6d5,stroke:#2f855a
    style G fill:#fefcbf,stroke:#b7791f
    style H fill:#fed7d7,stroke:#c53030
</div>

The path from task to output is determined by how quickly the agent can orient itself. Structure is the single biggest lever you control.

<!-- Speaker note: Walk through both paths. The happy path (left) takes 2-3 tool calls. The unhappy path (right) can consume 10-15 tool calls and still produce inferior results. Mention that this compounds -- agents that start with a wrong model make cascading errors. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## File Organization Patterns

Flat, nested, feature-based, and domain-driven -- which ones help agents most?

<!-- Section divider for organization patterns. -->

---

# Four Common Patterns

```
Flat                    Nested by Type           Feature-Based            Domain-Driven
-----------             ----------------         ----------------         ------------------
src/                    src/                     src/                     src/
  auth.ts                 controllers/             auth/                   domain/
  authTest.ts               authCtrl.ts              controller.ts           auth/
  user.ts                   userCtrl.ts              service.ts                entity.ts
  userTest.ts             services/                  model.ts                  repository.ts
  order.ts                  authSvc.ts               test.ts                   service.ts
  orderTest.ts              userSvc.ts             user/                     order/
  db.ts                   models/                    controller.ts             entity.ts
  utils.ts                  authModel.ts             service.ts                repository.ts
                            userModel.ts             model.ts                  service.ts
                          tests/                     test.ts               infrastructure/
                            auth.test.ts           order/                    database.ts
                            user.test.ts             controller.ts           cache.ts
```

Each pattern makes a different trade-off between discoverability and cohesion.

<!-- Speaker note: Don't declare a winner yet -- walk through each pattern's strengths and weaknesses on the next slide. The key point is that agents benefit from locality of reference: related files should be near each other. -->

---

# Pattern Comparison for Agents

| Criterion              | Flat                                              | Nested by Type                                      | Feature-Based                                      | Domain-Driven                                      |
|------------------------|---------------------------------------------------|-----------------------------------------------------|----------------------------------------------------|----------------------------------------------------|
| Discoverability        | <span class="vs-good">All files visible</span>    | <span class="vs-neutral">Predictable folders</span> | <span class="vs-good">Self-contained</span>        | <span class="vs-good">Self-contained</span>        |
| Scales past 20 files   | <span class="vs-bad">No</span>                    | <span class="vs-neutral">Somewhat</span>            | <span class="vs-good">Yes</span>                   | <span class="vs-good">Yes</span>                   |
| Agent context cost     | <span class="vs-good">Low (small projects)</span> | <span class="vs-bad">High (scattered)</span>        | <span class="vs-good">Low (co-located)</span>       | <span class="vs-good">Low (co-located)</span>       |
| Cross-cutting concerns | <span class="vs-neutral">Mixed in</span>          | <span class="vs-good">Grouped</span>                | <span class="vs-neutral">Duplicated</span>          | <span class="vs-good">Infra layer</span>           |
| Rename/refactor effort | <span class="vs-good">Low</span>                  | <span class="vs-bad">High (many folders)</span>     | <span class="vs-good">Low (one folder)</span>       | <span class="vs-neutral">Medium</span>              |

*Feature-based and domain-driven patterns give agents the best locality of reference -- the files they need for a task are co-located in one directory.*

<!-- Speaker note: Highlight the "Agent context cost" row. When an agent needs to understand the auth feature in a nested-by-type project, it must read from controllers/, services/, models/, and tests/ -- four separate directories. In feature-based, everything is in auth/. This difference is measurable in token cost and success rate. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## Naming Conventions

Names are the primary navigation signal for agents scanning a directory tree.

<!-- Section divider for naming conventions. -->

---

# Good Names vs. Bad Names

Names are the cheapest form of documentation. Agents read names before they read code.

```
Bad Names                           Good Names
-----------                         ---------------
src/                                src/
  utils.ts                            string-validation.ts
  helpers.ts                          date-formatting.ts
  misc.ts                             retry-with-backoff.ts
  stuff.ts                            error-codes.ts
  data.ts                             user-repository.ts
  manager.ts                          order-processing-pipeline.ts
  handler.ts                          webhook-event-handler.ts
  types.ts                            api-response-types.ts
  index.ts (re-exports only)          authentication-middleware.ts
```

> **Rule of thumb:** If an agent has to open a file to understand its purpose, the name has failed.

<!-- Speaker note: Walk through the "bad" column. An agent seeing utils.ts and helpers.ts has zero signal about what these files contain. It must open each one, consuming context window. Now look at the "good" column -- the agent can skip files that are irrelevant to its task without reading them. Mention that index.ts barrel files are particularly harmful because they hide the real structure. -->

---

# Naming Convention Checklist

Apply these consistently across the entire project:

- **Descriptive over short** -- `user-authentication-service.ts` beats `auth.ts`
- **Consistent casing** -- pick one (kebab-case for files, PascalCase for classes) and enforce it
- **Verb-noun for actions** -- `validate-input.ts`, `parse-config.ts`, `send-notification.ts`
- **Noun for data/models** -- `user-profile.ts`, `order-line-item.ts`
- **Suffix with role** -- `.controller.ts`, `.service.ts`, `.repository.ts`, `.test.ts`
- **Avoid generic names** -- never use `utils`, `helpers`, `misc`, `common`, `shared`, `stuff`

<div class="callout">

**Tip:** If you must have a utilities file, name it by what the utilities *do*: `string-utils.ts` or `array-transforms.ts`. An agent can skip `array-transforms.ts` when working on authentication.

</div>

<!-- Speaker note: Emphasize the "suffix with role" point. When an agent searches for the place to add business logic, it can immediately filter to .service.ts files. When it needs to fix a test, it searches for .test.ts. This convention acts as a built-in search index. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Documentation as Context

READMEs, type annotations, and docstrings are not just for humans -- they are agent navigation aids.

<!-- Section divider for documentation section. -->

---

# The Documentation Stack

<div class="mermaid">
graph TD
    A[Project README] --> B[Directory READMEs]
    B --> C[Type Annotations]
    C --> D[Docstrings / JSDoc]
    D --> E[Inline Comments]
    subgraph High["High signal, low cost"]
        A
        B
    end
    subgraph Medium["Medium signal, medium cost"]
        C
        D
    end
    subgraph Low["Targeted use only"]
        E
    end
    style High fill:#c6f6d5,stroke:#2f855a
    style Medium fill:#e0f0ff,stroke:#3182ce
    style Low fill:#fefcbf,stroke:#b7791f
</div>

Agents read from top to bottom. A strong README prevents the agent from ever needing to read individual files for orientation.

<!-- Speaker note: Explain the hierarchy. The project README is the highest-leverage document you can write because every agent reads it first. Directory READMEs are next -- they explain what a folder contains without the agent listing and reading each file. Type annotations and docstrings help once the agent is inside a file. Inline comments are the last resort. -->

---

# Type Annotations as Machine-Readable Docs

Type annotations are the most agent-friendly form of documentation because they are structured, verifiable, and colocated with the code.

```typescript
// Without types -- agent must read the implementation to understand the contract
function processOrder(order, options) {
  // ... 200 lines of code ...
}

// With types -- agent understands the contract from the signature alone
interface ProcessOrderOptions {
  validateInventory: boolean;
  applyDiscounts: boolean;
  notifyCustomer: boolean;
}

interface OrderResult {
  orderId: string;
  status: "confirmed" | "pending" | "failed";
  total: number;
  estimatedDelivery: Date;
}

function processOrder(
  order: Order,
  options: ProcessOrderOptions
): Promise<OrderResult> {
  // ... 200 lines of code ...
}
```

> The typed version gives an agent the full input/output contract without reading a single line of implementation.

<!-- Speaker note: This is one of the highest-impact changes you can make. When an agent needs to call processOrder, the untyped version forces it to read all 200 lines to figure out what it returns. The typed version gives the answer in the signature. Multiply this across every function in a codebase and the difference is enormous. Mention that Python type hints, Go interfaces, and Rust traits serve the same purpose. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 5

## Monorepos and Large Codebases

Strategies for keeping agent context manageable at scale.

<!-- Section divider for monorepos section. -->

---

# The Scale Problem

As codebases grow, agents face compounding challenges:

- **Context window limits** -- a 200-file project may exceed what an agent can hold at once
- **Ambiguous ownership** -- which team or module owns a given file?
- **Duplicated patterns** -- similar code in multiple packages, which is canonical?
- **Deep nesting** -- `packages/core/src/modules/auth/internal/helpers/validate.ts`

## Strategies That Work

1. **Workspace manifests** -- `package.json` workspaces, `go.work`, `Cargo.toml` workspace
2. **Per-package READMEs** -- each package explains its purpose, public API, and dependencies
3. **CODEOWNERS files** -- map directories to teams, doubling as an agent navigation index
4. **Explicit dependency graphs** -- declare inter-package dependencies, don't let agents guess
5. **Shallow nesting** -- keep maximum depth to 3-4 levels from the repo root

<!-- Speaker note: The key insight is that monorepos need explicit boundaries. Without them, an agent treats the entire repo as one project and wastes context trying to understand all of it. Workspace manifests and per-package READMEs create natural boundaries that let agents focus on the relevant package. Mention that CODEOWNERS files are surprisingly useful for agents -- they map directories to responsibilities, which helps agents understand what code lives where. -->

---

# Search-Friendly Structure

Design your project so agents can find what they need with simple searches:

```
project/
  CLAUDE.md                    <- Agent instructions and project overview
  README.md                    <- Human-readable project overview
  ARCHITECTURE.md              <- System design, component relationships
  packages/
    auth/
      README.md                <- Package purpose, public API, examples
      src/
        login.service.ts       <- Searchable by "login" AND "service"
        token.repository.ts    <- Searchable by "token" AND "repository"
        session.middleware.ts   <- Searchable by "session" AND "middleware"
      tests/
        login.service.test.ts  <- Matches the source file it tests
    payments/
      README.md
      src/
        charge.service.ts
        invoice.repository.ts
        refund.handler.ts
```

<div class="callout">

**Tip:** When an agent searches for "login", it should find exactly the files related to login -- not a utils file that happens to contain a login helper buried on line 847.

</div>

<!-- Speaker note: Emphasize the CLAUDE.md at the root. This is the single most impactful file for agent-assisted development. It tells the agent what the project is, what conventions to follow, and where to find things. Also note the naming pattern: every file is searchable by its domain concept AND its architectural role. An agent searching for "service" finds all services; searching for "login" finds all login-related code. -->

---

# Summary

## What We Covered

- **Structure is signal** -- project layout is the first thing agents read, and it determines their success rate
- **Feature-based organization** -- co-locate related files to minimize agent context cost
- **Descriptive naming** -- names should eliminate the need to open files for orientation
- **Documentation hierarchy** -- README > directory docs > types > docstrings > comments
- **Monorepo boundaries** -- use workspace manifests, per-package READMEs, and shallow nesting

## Practical Takeaways

1. Audit your project: can an agent understand each file's purpose from its name alone?
2. Add a root-level `CLAUDE.md` or `AGENTS.md` to every repository
3. Enforce type annotations on all public APIs
4. Keep directory depth under 4 levels from the repo root
5. Replace every `utils.ts` with a descriptively named alternative

<!-- Speaker note: Reinforce that these are not theoretical best practices -- they directly translate to measurable improvements in agent task completion rate. Encourage participants to try the audit exercise on their own projects: list their files and see how many require opening to understand their purpose. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Questions?

## Thank you for attending

Agent Ready Academy -- Module 5: Project Structure for Agents

<!-- End of presentation. -->
