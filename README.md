# Academy Template

A reusable Next.js learning platform template. Copy this directory, run `setup.sh`, and let an LLM create your content.

## What You Get

- Interactive MDX lessons with Mermaid diagrams, code blocks, and quizzes
- AI chat tutor powered by Claude (via Vertex AI)
- Red Hat branded presentation slides (Marp)
- Dark/light theme toggle
- Progress tracking (localStorage)
- Export to Markdown and Jupyter notebooks
- Docker deployment ready

## Quick Start

```bash
# 1. Copy the template
cp -r template/ my-academy/
cd my-academy/

# 2. Configure your academy
bash setup.sh

# 3. Install dependencies
pnpm install

# 4. Create content (use the prompts in prompts/)
# See CLAUDE.md for the full content authoring guide

# 5. Preview
pnpm dev
```

## For LLM Content Authors

Read `CLAUDE.md` — it contains everything you need to know about creating content. The structured prompts in `prompts/` guide you through each step:

1. `prompts/01-curriculum-design.md` — Design your module/lesson structure
2. `prompts/02-lesson-writing.md` — Write individual lessons
3. `prompts/03-quiz-creation.md` — Create quiz questions
4. `prompts/04-presentation-creation.md` — Build slide decks
5. `prompts/05-content-quality.md` — Review and polish content

## Project Structure

```
academy.config.ts     # Central config (name, slug, tutor prompt, colors)
content/              # Your lessons go here
  module-N/
    meta.json         # Module metadata + lesson manifest
    NN-lesson.mdx     # Lesson content
presentations/        # Your slide decks go here
  NN-deck.md          # Marp presentation
src/                  # App code (do not modify)
prompts/              # Structured prompts for content creation
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server at localhost:3000 |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `cd presentations && bash build.sh` | Build slide decks |
| `docker compose up --build` | Run in Docker |

## Requirements

- Node.js 22+
- pnpm
- Python 3.x (for export script)
- Google Cloud credentials (for AI chat)
