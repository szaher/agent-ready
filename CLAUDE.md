# Agent Ready Academy

## Build, Test, Lint

```bash
pnpm install
pnpm build                    # Production build (standalone server)
pnpm build:static             # Static export for GitHub Pages
pnpm dev                      # Development server

pnpm test                     # Run all tests (vitest)
pnpm test -- src/lib/         # Run tests for a directory
pnpm test -- --grep "theme"   # Run tests matching pattern

pnpm lint                     # ESLint
pnpm validate                 # Content quality gates (specs, MDX, links, citations, a11y)
```

Run `pnpm validate`, `pnpm test`, `pnpm lint`, and `pnpm build` before considering any task done.

## Code Style

- TypeScript strict mode. Never use `any`.
- Use `import type` for type-only imports.
- Use `@/` path alias for all imports from `src/`. Relative imports only for adjacent files.
- No barrel exports (no `index.ts` re-exporting siblings).
- Components: PascalCase filenames, `export default function`. Add `"use client"` only when the component needs interactivity.
- Hooks: camelCase prefixed with `use` (`useTheme.ts`).
- Lib/utilities: camelCase filenames (`progress.ts`, `curriculum.ts`).
- Tailwind CSS with CSS variables for theming (`--bg-primary`, `--accent-blue`). No CSS modules.
- Local state only (useState, useRef). No Redux/Context/Zustand.
- Tests in `__tests__/` mirroring `src/` structure. Vitest + Testing Library.

## Architecture

```
academy.config.ts          # Display name, tutor prompt, colors, storage keys
content/
  module-N/
    meta.json              # Module metadata and lesson manifest
    NN-slug.mdx            # Lesson content (MDX with frontmatter quizzes)
  CLAUDE.md                # Scoped content-authoring instructions
prompts/                   # Staged generation prompts (curriculum, lessons, quizzes)
  schemas/                 # JSON Schema contracts
presentations/             # Marp slide decks
scripts/
  validate.mjs             # Content quality gates
  build-static.mjs         # Reversible static export builder
src/
  app/                     # Next.js App Router (pages, layouts, API routes)
    api/chat/              # AI tutor streaming endpoint (Anthropic Vertex)
    api/export/            # Curriculum export endpoint
    lesson/[module]/[lesson]/ # Dynamic lesson page
  components/              # React components (PascalCase)
  hooks/                   # Custom hooks (useTheme, useSpeechSynthesis)
  lib/                     # Business logic (curriculum, progress, notes, speech)
  types/                   # TypeScript interfaces
.claude/agents/            # Custom agent definitions
```

Data flow: Filesystem (`content/`) → `curriculum.ts` → Server Components → Client Components

## Do's and Don'ts

- Do NOT modify `src/`, `__tests__/`, or root config files when doing content work.
- Do NOT use `#` headings inside MDX lesson bodies — the page renders its own title.
- Do NOT use `<div class="mermaid">` in MDX lessons — use `MermaidDiagram` or `Diagram`.
- Do NOT use `MermaidDiagram` in presentation decks — use `<div class="mermaid">`.
- Do NOT invent citations or state versions/prices/popularity without fresh evidence.
- Do NOT install packages without discussing first.
- Do NOT hardcode academy display text — it belongs in `academy.config.ts`.
- Escape `${{ }}` as `\${{ }}` inside MDX CodeBlock template literals (GitHub Actions syntax breaks MDX).
- Mark uncertain factual claims with `VerifyClaim` instead of presenting them as facts.

## Content Authoring

See `content/CLAUDE.md` for the full content-authoring guide covering tutorial specs, MDX components, citation rules, accessibility, and the required authoring flow.

Quick reference: specs go in `content/tutorials/*.json`, lessons in `content/module-N/NN-slug.mdx`, presentations in `presentations/NN-name.md`.
