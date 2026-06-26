---
marp: true
theme: academy
header: 'Agent Ready Academy'
footer: 'Hooks, Permissions, and Safety'
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

# Hooks, Permissions, and Safety

## Guardrails That Let Agents Move Fast Without Breaking Things

Agent Ready Academy | Module 7

---

# Agenda

- Why safety matters -- the real risks of autonomous code execution
- Permission models -- allowlists, deny patterns, and the three-tier hierarchy
- The hooks system -- pre/post-tool hooks, event types, and matcher patterns
- Sandboxing and isolation -- worktrees, containers, and review gates
- Designing your safety framework -- building a complete production config

<!-- Speaker note: This module is the bridge between "agents can do things" and "agents can do things I trust." Every concept here exists because someone learned a lesson the hard way. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## Why Safety Matters

What goes wrong when agents operate without guardrails.

---

# The Risk Surface

Autonomous agents can read, write, and execute. That power creates three threat categories:

- **Destructive operations** -- `git push --force`, `rm -rf`, `DROP TABLE` -- an agent optimizing for task completion may choose the fastest path, not the safest
- **Data exfiltration** -- piping secrets to external URLs, embedding credentials in commits, or leaking `.env` contents through error messages
- **Supply chain compromise** -- installing unvetted packages, running arbitrary `curl | bash` scripts, or modifying CI pipelines

> Without guardrails, you are giving a capable but context-limited system root-level access to your codebase and infrastructure.

<!-- Speaker note: These aren't hypothetical. Early adopters saw agents run "git reset --hard" to fix merge conflicts, install malicious packages with similar names, and push API keys in debug logging. The agent wasn't malicious -- it was just solving the problem it was given. -->

---

# The Guardrails Stack

Safety is not a single feature -- it is a layered system:

<div class="mermaid">
graph TD
    A["Layer 4: Human Review Gates"] --> B["Layer 3: Hook System"]
    B --> C["Layer 2: Permission Model"]
    C --> D["Layer 1: Sandboxed Execution"]
    style A fill:#daf2f2,stroke:#009999
    style B fill:#e0f0ff,stroke:#0066cc
    style C fill:#e0f0ff,stroke:#0066cc
    style D fill:#fef0f0,stroke:#cc0000
</div>

Each layer catches what the layer below misses. A robust safety framework uses **all four**.

<!-- Speaker note: Think of this like defense in depth in security. No single layer is sufficient. Sandboxing limits blast radius. Permissions limit which tools fire. Hooks add custom logic. Human review catches everything else. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## Permission Models

Controlling what agents are allowed to do.

---

# Permission Modes

Agents operate in one of three modes. Choose based on your trust level and task type:

| Mode | Behavior | Best For |
|------|----------|----------|
| **Ask every time** | Prompts before each tool call | First-time setup, unfamiliar repos |
| **Allowlist** | Auto-approves matched patterns, prompts for the rest | Daily development, trusted workflows |
| **YOLO / Auto-accept** | Approves everything except explicit denials | Batch operations, fully sandboxed envs |

<div class="callout">

**Rule of thumb:** Start restrictive and widen. It is far easier to add a permission than to undo a destructive action.

</div>

<!-- Speaker note: Most teams land on allowlist mode for day-to-day work. YOLO mode sounds scary but is safe when combined with Docker isolation -- the agent can't escape the container. Ask mode is useful during the first week of adoption to learn what permissions you actually need. -->

---

# The Three-Tier Hierarchy

Permissions are defined at three levels. **More specific scopes win**:

<div class="mermaid">
graph LR
    A["Global<br/>~/.claude/settings.json"] --> B["User<br/>~/.claude/settings.local.json"]
    B --> C["Project<br/>.claude/settings.json"]
    C --> D["Effective<br/>Permissions"]
    A -.->|"Lowest priority"| D
    C -.->|"Highest priority"| D
    style A fill:#f2f2f2,stroke:#666666
    style B fill:#e0f0ff,stroke:#0066cc
    style C fill:#daf2f2,stroke:#009999
    style D fill:#e0f0ff,stroke:#0066cc
</div>

- **Global** -- your personal defaults across all projects
- **User** -- per-user overrides (not committed to git)
- **Project** -- team-shared rules (committed to `.claude/settings.json`)

<!-- Speaker note: The merge logic is important. Project settings override user settings, which override global settings. This means a team lead can set project-level deny rules that individual developers cannot bypass in their personal config. -->

---

# Allowlists and Deny Patterns

Permissions use pattern matching on tool names and arguments:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(npm run lint)",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Read",
      "Edit"
    ],
    "deny": [
      "Bash(git push*)",
      "Bash(git reset --hard*)",
      "Bash(rm -rf*)",
      "Bash(curl*|*sh)",
      "Bash(docker run*)"
    ]
  }
}
```

**Allow** entries auto-approve silently. **Deny** entries block without prompting. Everything else triggers a permission prompt.

<!-- Speaker note: The glob patterns use asterisk for wildcards. "Bash(git diff*)" matches "git diff", "git diff --staged", "git diff HEAD~3", etc. Deny patterns are checked first -- a deny always wins over an allow. The "curl pipe to sh" pattern catches the classic supply chain attack vector. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 3

## The Hooks System

Running custom logic before and after tool calls.

---

# What Are Hooks?

Hooks are **user-defined commands** that run at specific points in the agent lifecycle:

| Hook Type | Fires When | Can Block? |
|-----------|-----------|------------|
| **PreToolUse** | Before a tool executes | Yes -- non-zero exit stops the tool |
| **PostToolUse** | After a tool completes | No -- tool already ran |
| **Notification** | Agent wants user attention | No -- informational only |
| **Stop** | Agent session ends | No -- cleanup only |

Hooks run as subprocesses. They receive a **JSON payload** on stdin with full context about the tool call.

<!-- Speaker note: PreToolUse is the most powerful hook type. It lets you intercept any tool call and decide whether it should proceed. Think of it as middleware for agent actions. PostToolUse is useful for logging, metrics, and triggering downstream workflows. -->

---

# Hook Lifecycle

<div class="mermaid">
sequenceDiagram
    participant Agent
    participant Hooks as Hook Runner
    participant Tool
    participant Post as PostToolUse

    Agent->>Hooks: PreToolUse (tool name + args)
    Hooks->>Hooks: Run all matching hooks
    alt Any hook returns non-zero
        Hooks-->>Agent: BLOCKED (stderr message shown)
    else All hooks pass
        Hooks->>Tool: Execute tool
        Tool-->>Hooks: Result
        Hooks->>Post: PostToolUse (tool + result)
        Post-->>Agent: Continue
    end
</div>

<!-- Speaker note: The key insight is that PreToolUse hooks run sequentially and any single hook can veto the operation. This gives you composable safety -- one hook checks for secrets, another checks file paths, a third enforces naming conventions. They all run independently. -->

---

# Configuring Hooks

Hooks are defined in `settings.json` with **matchers** that control which tool calls trigger them:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "python3 .claude/hooks/check-command.py",
        "timeout": 5000
      },
      {
        "matcher": "Edit",
        "command": "bash .claude/hooks/check-protected-files.sh",
        "timeout": 3000
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "command": "bash .claude/hooks/post-commit-notify.sh",
        "timeout": 10000
      }
    ]
  }
}
```

- **`matcher`** -- tool name with optional argument glob pattern
- **`command`** -- shell command to execute (receives JSON on stdin)
- **`timeout`** -- milliseconds before the hook is killed

<!-- Speaker note: The matcher pattern language is the same as the permission patterns. A bare "Bash" matches all Bash calls. "Bash(git commit*)" only matches git commit commands. The timeout is critical -- a hanging hook blocks the agent indefinitely without it. -->

---

# Hook Input Payload

Every hook receives a JSON object on stdin with the tool call context:

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "git push origin main --force"
  },
  "session_id": "abc-123",
  "working_directory": "/home/user/project"
}
```

Your hook script reads stdin, inspects the payload, and decides:
- **Exit 0** -- allow the operation to proceed
- **Exit non-zero** -- block the operation; stderr is shown to the agent as the reason

<div class="callout">

**Tip:** Write hooks in Python for complex logic (JSON parsing, regex matching). Use Bash for simple pattern checks.

</div>

<!-- Speaker note: A common pattern is a Python script that loads a deny-list of dangerous command patterns from a YAML config file, then regex-matches against the incoming command. This way you can update the deny list without changing the hook code. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 4

## Sandboxing and Isolation

Limiting the blast radius when things go wrong.

---

# Isolation Strategies

Even with permissions and hooks, defense in depth demands **execution isolation**:

- **Git worktrees** -- agent works on an isolated branch in a separate directory; main branch is untouched until you merge
- **Docker containers** -- agent runs inside a container with no network access to production systems and a read-only filesystem mount
- **Review gates** -- require human approval before commits, pushes, or deployments; the agent proposes, the human disposes

<div class="mermaid">
graph LR
    A[Agent Task] --> B{Isolation Level}
    B -->|Low risk| C["Worktree<br/>Branch isolation"]
    B -->|Medium risk| D["Container<br/>Full sandbox"]
    B -->|High risk| E["Container + Gate<br/>Sandbox + approval"]
    C --> F["Merge after review"]
    D --> F
    E --> G["Human approves merge"]
    style C fill:#daf2f2,stroke:#009999
    style D fill:#e0f0ff,stroke:#0066cc
    style E fill:#fef0f0,stroke:#cc0000
</div>

<!-- Speaker note: The choice of isolation level depends on what the agent is doing. Refactoring an internal module? Worktree is fine. Modifying CI config or infrastructure? Container plus review gate. The cost of isolation is latency -- containers take seconds to spin up. The cost of no isolation is potentially catastrophic. -->

---

# Worktree Isolation in Practice

Git worktrees give agents a **separate working directory** on an isolated branch:

```bash
# Agent creates a worktree automatically
# Work happens in .claude/worktrees/feature-xyz/
# Main branch is completely untouched

# When done, human reviews and merges:
git diff main...feature-branch    # Review all changes
git merge feature-branch          # Accept the work
```

**Why worktrees beat regular branches:**
- The agent **cannot** accidentally modify your working directory
- You can continue working on `main` while the agent works in the worktree
- If the agent produces bad output, `git worktree remove` cleans up instantly

<div class="callout">

**Key insight:** Worktrees make agent work **non-destructive by default**. The worst case is deleting the worktree -- your code is untouched.

</div>

<!-- Speaker note: Worktrees are the single most underused safety feature. Most teams don't know they exist. The mental model is simple: your repo can have multiple checked-out copies at different paths, each on a different branch, sharing the same git history. The agent works in one copy while you work in another. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 5

## Designing Your Safety Framework

Putting it all together into a production-ready configuration.

---

# A Complete Safety Config

Here is a real-world `.claude/settings.json` combining all four layers:

```json
{
  "permissions": {
    "allow": [
      "Read", "Edit",
      "Bash(npm test*)", "Bash(npm run lint*)",
      "Bash(git status)", "Bash(git diff*)", "Bash(git log*)",
      "Bash(git add*)", "Bash(git commit*)"
    ],
    "deny": [
      "Bash(git push --force*)", "Bash(git reset --hard*)",
      "Bash(rm -rf*)", "Bash(curl*|*sh)", "Bash(npm publish*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "command": "python3 .claude/hooks/scan-secrets.py", "timeout": 5000 },
      { "matcher": "Edit", "command": "bash .claude/hooks/protect-lockfiles.sh", "timeout": 3000 }
    ],
    "PostToolUse": [
      { "matcher": "Bash(git commit*)", "command": "bash .claude/hooks/run-tests.sh", "timeout": 30000 }
    ]
  }
}
```

<!-- Speaker note: Walk through this config line by line. The allow list covers the read-write-test loop that agents need for normal development. The deny list blocks the operations that can cause irreversible damage. The PreToolUse hook scans every bash command for leaked secrets and prevents editing lock files. The PostToolUse hook runs tests after every commit to catch regressions immediately. -->

---

# The Safety Checklist

Before giving an agent access to any codebase, verify these five items:

1. **Permission deny list** -- have you blocked destructive commands? (`push --force`, `reset --hard`, `rm -rf`, `publish`)
2. **Secret scanning** -- does a hook check for API keys, tokens, and credentials before they hit disk?
3. **Protected files** -- are lock files, CI configs, and generated code guarded by an Edit hook?
4. **Isolation strategy** -- is the agent working in a worktree or container, not your main checkout?
5. **Review gate** -- is there a human approval step before any change reaches production?

> Score yourself: 5/5 means production-ready. Below 3/5 means you are operating without a safety net.

<!-- Speaker note: Print this checklist and tape it to your monitor for the first month. After that it becomes muscle memory. The most commonly skipped item is number 4 -- isolation. Teams set up permissions and hooks but still let the agent work directly on their main branch. That's like wearing a seatbelt but not having brakes. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Key Takeaways

**Permissions** control *what* tools an agent can use.
**Hooks** control *how* those tools behave.
**Sandboxing** limits *where* the damage can spread.
**Review gates** ensure *humans stay in the loop*.

Layer all four. Start restrictive. Widen with confidence.

<!-- Speaker note: Reiterate the core message: safety is not about limiting the agent's capability. It is about channeling that capability through controlled paths. A well-configured safety framework actually makes agents MORE useful because you can trust them with bigger tasks. End with: "In the next module, we'll look at multi-agent orchestration -- where safety becomes even more critical because agents are delegating to other agents." -->
