# Academy Template — Content Author Guide

You are building an interactive learning academy. The platform code is complete — your job is to **create content only**. Do not modify any source files under `src/`, `__tests__/`, or config files unless explicitly asked.

## Quick Start

1. Run `bash setup.sh` to configure the academy (name, topic, colors)
2. Create modules in `content/module-N/`
3. Create presentation decks in `presentations/`
4. Build and verify: `pnpm build && pnpm dev`

## Architecture Overview (Read-Only Reference)

```
academy.config.ts          <- The ONLY file you customize (or use setup.sh)
content/
  module-1/
    meta.json              <- Module metadata + lesson manifest
    01-lesson-slug.mdx     <- Lesson content (MDX)
    02-another-lesson.mdx
  module-2/
    meta.json
    01-first-lesson.mdx
presentations/
  themes/academy.css       <- Marp theme (Red Hat branding)
  01-deck-name.md          <- Presentation slides (Marp markdown)
  build.sh                 <- Builds slides to HTML
  fix-mermaid.sh           <- Injects Mermaid.js into slide decks
src/                       <- DO NOT MODIFY
```

The app reads `content/` at build time. Modules are discovered by scanning `content/module-N/meta.json` files. Lessons are loaded from the MDX files listed in each `meta.json`.

## Content Creation Workflow

Follow this order:

1. **Design curriculum** — decide modules, lessons, progression
2. **Create modules** — write `meta.json` for each module
3. **Write lessons** — create `.mdx` files with diagrams, code, quizzes
4. **Create presentations** — write Marp slide decks for key topics
5. **Verify** — `pnpm build` must succeed; browse `localhost:3000` to check rendering

---

## File Formats

### meta.json

Every module directory needs a `meta.json`. The `id` field must match the directory number (`module-1` has `id: 1`).

```json
{
  "id": 1,
  "title": "Getting Started",
  "description": "Introduction to the core concepts",
  "color": "#68d391",
  "lessons": [
    {
      "slug": "01-lesson-name",
      "title": "Lesson Title",
      "description": "One-line description of this lesson",
      "estimatedMinutes": 10,
      "diagramTypes": ["architecture", "flowchart"],
      "hasCode": true,
      "hasQuiz": true
    }
  ]
}
```

Rules:
- `slug` must exactly match the MDX filename without extension
- `estimatedMinutes` is displayed in the sidebar
- `diagramTypes` is informational — used for the sidebar icon
- `hasCode` and `hasQuiz` are informational booleans
- `color` uses a hex color — pick from the palette in `academy.config.ts`
- Lessons appear in the order listed in the `lessons` array

### MDX Lessons

Each lesson is a `.mdx` file with YAML frontmatter and MDX body.

#### Frontmatter

```yaml
---
title: "Lesson Title"
quiz:
  - question: "What does X do?"
    options:
      - "Option A"
      - "Option B (correct)"
      - "Option C"
      - "Option D"
    correctIndex: 1
  - question: "Which is true about Y?"
    options:
      - "Statement 1"
      - "Statement 2"
      - "Statement 3"
    correctIndex: 2
---
```

- `title` is required
- `quiz` is optional — omit it for lessons without quizzes
- `correctIndex` is zero-based
- Include 3-4 options per question
- Vary `correctIndex` across questions (don't always use 0)

#### Body Content

Use `##` for section headings (never `#` — that's reserved for the page title). Write paragraphs with **bold** for key terms.

#### MermaidDiagram Component

```mdx
<MermaidDiagram chart={`graph TD
    A[Node A] --> B[Node B]
    B --> C[Node C]
    subgraph Group["Group Name"]
        C --> D[Node D]
    end
    style Group fill:#ebf8ff,stroke:#3182ce
`} />
```

Supported diagram types: `graph TD`, `graph LR`, `graph RL`, `flowchart TD`, `sequenceDiagram`, `classDiagram`, `stateDiagram-v2`.

Use subgraphs to group related nodes. Apply `style` directives for color coding.

#### CodeBlock Component

```mdx
<CodeBlock code={`def example():
    return "hello world"
`} language="python" filename="example.py" />
```

- `language` — syntax highlighting language (python, javascript, typescript, yaml, bash, etc.)
- `filename` — displayed as a tab header above the code

#### Standard Markdown

All standard markdown works in the body:

- **Bold text** for key terms
- *Italic text* for emphasis
- Bulleted lists with `-`
- Numbered lists with `1.`
- `inline code` for function/class names
- Blockquotes with `>`
- Tables with `|` pipes

### Presentation Decks (Marp)

Presentations are Marp markdown files in `presentations/`. Name them `NN-descriptive-name.md` (e.g., `01-introduction.md`, `02-core-concepts.md`).

#### Frontmatter

```markdown
---
marp: true
theme: academy
header: 'Your Academy Name'
footer: 'Deck Title'
paginate: true
---
```

#### Mermaid Script Injection

Immediately after the closing `---` of frontmatter, add:

```html
<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: true, theme: "base", themeVariables: { primaryColor: "#e0f0ff", primaryTextColor: "#151515", primaryBorderColor: "#0066cc", lineColor: "#0066cc", secondaryColor: "#daf2f2", tertiaryColor: "#f2f2f2", noteBkgColor: "#fef0f0", noteTextColor: "#151515", fontFamily: "Red Hat Text, sans-serif" }});
</script>
```

#### Slide Types

**Title slide (lead):**
```markdown
<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Presentation Title

## Subtitle

Presenter Name | Date
```

**Section divider:**
```markdown
<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Section Title

## Brief description of this section
```

**Content slide with bullets:**
```markdown
# Slide Title

- **Key point** -- explanation
- **Another point** -- details
- **Third point** -- context

> Important callout or quote
```

**Content slide with table:**
```markdown
# Comparison

| Feature    | Option A    | Option B    |
|------------|-------------|-------------|
| Speed      | Fast        | Moderate    |
| Cost       | High        | Low         |
```

Use `<span class="vs-good">Good</span>`, `<span class="vs-bad">Bad</span>`, `<span class="vs-neutral">Neutral</span>` for colored table values.

**Content slide with diagram:**
```markdown
# Architecture

<div class="mermaid">
graph LR
    A[Input] --> B[Process]
    B --> C[Output]
</div>
```

Note: In presentations, use `<div class="mermaid">` (NOT the `<MermaidDiagram>` component — that's for MDX lessons only).

**Content slide with code:**
````markdown
# Code Example

```python
def process(data):
    return transform(data)
```
````

**Callout box:**
```html
<div class="callout">

**Tip:** Important information here.

</div>
```

**Speaker notes:**
```markdown
<!-- Speaker note: This won't be shown in the slides. -->
```

#### Slide Separator

Use `---` on its own line to separate slides.

---

## Naming Conventions

- Module directories: `module-1`, `module-2`, ..., `module-N`
- Lesson files: `NN-descriptive-slug.mdx` (e.g., `01-introduction.mdx`, `02-data-loading.mdx`)
- Presentation files: `NN-descriptive-name.md` (e.g., `01-overview.md`)
- Slugs use lowercase with hyphens, no spaces or underscores

## Content Style Guide

- Lead with a **why** before diving into **how**
- Bold the first occurrence of every key term
- Use diagrams to explain architecture and data flow — don't just describe in text
- Include at least one code example per lesson that has `hasCode: true`
- Keep quizzes to 2-4 questions per lesson
- Make quiz distractors plausible — avoid obviously wrong answers
- Use blockquotes for tips, warnings, and key takeaways
- Each lesson should cover one focused concept (8-15 min read)
- Progress from concrete to abstract within each module
- Use analogies to connect new concepts to familiar ones

## Anti-Patterns

- Do NOT use `#` headings in lesson body — only `##` and `###`
- Do NOT use `<MermaidDiagram>` in presentations — use `<div class="mermaid">`
- Do NOT use `<div class="mermaid">` in MDX lessons — use `<MermaidDiagram>`
- Do NOT use `<CodeBlock>` in presentations — use fenced code blocks
- Do NOT modify files in `src/`, `__tests__/`, or root config files
- Do NOT hardcode the academy name in content — the app reads it from `academy.config.ts`
- Do NOT skip the `meta.json` — lessons won't appear without it
- Do NOT use `correctIndex` values that exceed the options array length

## Build & Verify Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build (verifies all content compiles)
pnpm build

# Run tests
pnpm test

# Build presentation slides
cd presentations && bash fix-mermaid.sh && bash build.sh

# Export lessons to markdown/notebooks
pip install -r scripts/requirements.txt
python scripts/export.py
```

## academy.config.ts Reference

This is the single customization file. Edit it directly or use `setup.sh`.

```typescript
export const academy = {
  name: "Your Academy Name",        // Displayed in header, title bar
  slug: "your-academy",             // Used for localStorage keys (no spaces)
  description: "One-line summary",   // HTML meta description
  tagline: "Catchy subtitle",        // Displayed on home page

  tutor: {
    systemPrompt: `...`,             // AI tutor personality and knowledge
    codeLanguage: "python",          // Primary code language
    chatPlaceholder: "Ask a question...",
    chatWelcome: "Welcome message",
    chatSubtext: "Subtitle under welcome",
  },

  accentColor: "#63b3ed",           // UI accent (dot indicator, etc.)
  moduleColors: ["#68d391", ...],   // One color per module sidebar

  presentation: {
    theme: "academy",               // Marp theme name
    header: "Your Academy Name",    // Slide header text
  },
} as const;
```

## Docker

```bash
# Build and run
docker compose up --build

# Required: set your GCP project for AI chat
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id
```

The AI chat tutor requires Google Cloud credentials with Vertex AI access. Set `GOOGLE_APPLICATION_CREDENTIALS` or use application default credentials.

## Book Export

Convert your academy content into a publishable book (PDF, ePub, HTML).

```bash
# Build PDF (default)
bash scripts/build-book.sh

# Build PDF + ePub
bash scripts/build-book.sh --formats pdf,epub

# Build all formats
bash scripts/build-book.sh --formats pdf,epub,html

# Clean and rebuild
bash scripts/build-book.sh --clean
bash scripts/build-book.sh --formats pdf,epub
```

The script reads all `content/module-N/` directories, transforms MDX to clean Markdown, extracts quizzes into an exercises appendix, collects bold terms into a glossary, and runs Pandoc to produce the final book.

**Prerequisites:** `pandoc`, `xelatex` (TinyTeX or MacTeX), `mermaid-filter` (npm). See `prompts/06-book-conversion.md` for full toolchain setup and the complete book authoring guide.

**Output:** `book/output/book.pdf`, `book/output/book.epub`, `book/output/book.html`

Edit `book/metadata.yaml` after the first build to set the author name, subtitle, and licensing.
