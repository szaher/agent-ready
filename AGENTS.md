# Agent Instructions

This repository has two operational modes. Pick the right scope for your task.

## Content Authoring

Write tutorial specs, lessons, quizzes, and presentations. Work inside `content/` and `presentations/`.

- Do NOT modify `src/`, `__tests__/`, root config, or CI files.
- Follow the authoring flow in `content/CLAUDE.md`.
- Run `pnpm validate` before considering content ready.
- Use the `/content-author` agent for guided content work.

## Platform Development

Modify the Next.js app, components, hooks, or build tooling in `src/` and `scripts/`.

- Follow code style in `CLAUDE.md`.
- Run `pnpm test`, `pnpm lint`, and `pnpm build` before considering work done.
- Use the `/platform-dev` agent for platform changes.

## Custom Agents

Available in `.claude/agents/`:

| Agent | Role | Scope |
|-------|------|-------|
| `content-author` | Write and edit tutorial content | `content/`, `presentations/` — read + write |
| `code-reviewer` | Review code changes | Entire repo — read only, no modifications |
| `platform-dev` | Modify platform code | `src/`, `scripts/`, config — read + write + bash |

## Permission Model

- **Content agents** may read any file but only write to `content/` and `presentations/`.
- **Review agents** are strictly read-only. They do not modify files or run commands.
- **Platform agents** may read, write, and run build/test/lint commands. They do not modify `content/`.

## Template Sync

When updating an academy instance from the template:

```bash
scripts/update-template.sh --target /path/to/academy-instance
```

Use `--dry-run` first. Preserve academy-owned files: `content/`, `presentations/`, `academy.config.ts`, `.env*`, `docker-compose.yml`. After updating, run `pnpm install && pnpm validate && pnpm test && pnpm lint && pnpm build`.
