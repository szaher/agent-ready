# Agent Ready Academy

An interactive learning platform that teaches developers how to make their codebases agent-ready. Built with Next.js, MDX, and Tailwind CSS, it covers everything from writing effective `CLAUDE.md` files to building multi-agent workflows.

## What You'll Learn

The curriculum spans 10 modules with 50 lessons:

| Module | Topic |
| --- | --- |
| 1 | Why Agent-Ready Matters |
| 2 | How AI Coding Agents Work |
| 3 | CLAUDE.md — Your Agent's Playbook |
| 4 | Custom Agents and Multi-Agent Patterns |
| 5 | Project Structure for Agents |
| 6 | MCP — Model Context Protocol |
| 7 | Hooks, Permissions, and Safety |
| 8 | Context Management |
| 9 | Workflows and CI/CD Integration |
| 10 | Advanced Patterns and Scaling |

## Features

- **Interactive lessons** — MDX-based content with quizzes, diagrams, code blocks, and callouts
- **AI tutor** — Chat with an AI assistant that explains concepts with Mermaid diagrams and code examples
- **Progress tracking** — Local storage-based progress across lessons and modules
- **Presentation decks** — Marp slide decks for each module (in `presentations/`)
- **Text-to-speech** — Built-in voice narration for lesson content
- **Dark/light theme** — Toggle between themes
- **Notes** — Per-lesson note-taking
- **Static export** — Deploy to GitHub Pages with `pnpm build:static`
- **Content quality gates** — Automated validation for specs, MDX, links, citations, and accessibility

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm

### Install and Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: AI Tutor

The AI tutor uses Anthropic's Claude via Vertex AI. Set your Google Cloud credentials to enable it — the app works fully without it.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build (standalone server) |
| `pnpm build:static` | Static export for GitHub Pages |
| `pnpm start` | Start the production server |
| `pnpm test` | Run all tests (Vitest) |
| `pnpm lint` | Run ESLint |
| `pnpm validate` | Content quality gates (specs, MDX, links, citations, a11y) |

## Project Structure

```
academy.config.ts              # Academy name, colors, tutor prompt, storage keys
content/
  module-N/
    meta.json                  # Module metadata and lesson manifest
    NN-slug.mdx                # Lesson content (MDX with frontmatter quizzes)
presentations/
  NN-topic.md                  # Marp slide decks per module
src/
  app/                         # Next.js App Router
    api/chat/                  # AI tutor streaming endpoint (Anthropic Vertex)
    api/export/                # Curriculum export endpoint
    lesson/[module]/[lesson]/  # Dynamic lesson pages
  components/                  # React components (Header, Sidebar, Quiz, etc.)
  hooks/                       # Custom hooks (useTheme, useSpeechSynthesis)
  lib/                         # Business logic (curriculum, progress, notes, speech)
  types/                       # TypeScript interfaces
scripts/
  validate.mjs                 # Content quality gates
  build-static.mjs             # Static export builder
.claude/
  agents/                      # Custom agent definitions (code-reviewer, content-author, platform-dev)
.github/workflows/
  ci.yml                       # CI pipeline
  pages.yml                    # GitHub Pages deployment
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 with CSS variable theming
- **Content:** MDX via next-mdx-remote
- **Diagrams:** Mermaid
- **Code editor:** Monaco Editor
- **Charts:** D3
- **AI:** Anthropic Claude (Vertex AI SDK)
- **Testing:** Vitest + Testing Library
- **Presentations:** Marp

## Contributing

See `content/CLAUDE.md` for content authoring guidelines. The project uses three custom agent definitions in `.claude/agents/` for different contribution types:

- **content-author** — Writing and editing lessons
- **code-reviewer** — Reviewing pull requests
- **platform-dev** — Working on the app itself

## License

See [LICENSE](./LICENSE).
