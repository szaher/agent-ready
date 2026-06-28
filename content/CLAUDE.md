# Content Authoring Guide

## Required Flow

1. Define the tutorial with `prompts/01-curriculum-design.md`.
2. (Optional) Select voice (`conversational`, `academic`, `systematic`, `narrative`, `minimalist`) and approaches (`socratic`, `problem-based`, `hands-on`, `analogical`, `visual-first`, `challenge-based`).
3. Save a validated `TutorialSpec` JSON in `content/tutorials/`. Use `schemaVersion: "1.1.0"` for specs with enhancements, `"1.0.0"` for legacy.
4. Plan sources and claim coverage before writing lessons.
5. Plan multimedia with `prompts/08-multimedia-planning.md`.
6. Generate lessons, assessments, and artifacts with `prompts/02-*`, `03-*`, `04-*`.
7. Move approved MDX into `content/module-N/`.
8. Run `pnpm validate`, `pnpm test`, `pnpm lint`, `pnpm build`.
9. Human review for factuality, pedagogy, accessibility, and all `verify` claims.

Use `prompts/07-repair-invalid-output.md` when output fails schema, MDX, or citation checks.

## Tutorial Specs

Every production tutorial needs a `TutorialSpec` JSON document capturing audience, prerequisites, objectives, lesson sequence, concepts, exercises, assessment, and accessibility metadata. The TypeScript contract is in `src/types/tutorial.ts`; the JSON Schema is in `prompts/schemas/tutorial-spec.schema.json`.

## Module Metadata

Every `module-N/` directory needs `meta.json`:

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
      "description": "One-line description",
      "estimatedMinutes": 10,
      "diagramTypes": ["architecture"],
      "hasCode": true,
      "hasQuiz": true
    }
  ]
}
```

- `id` must match the directory number.
- `slug` must exactly match the MDX filename without extension.
- Use colors from `academy.config.ts`.

## MDX Lessons

Use `##` for sections. Do NOT use `#` — the page renders its own title.

Frontmatter quizzes:

```yaml
---
title: "Lesson Title"
quiz:
  - question: "Question text"
    options: ["A", "B", "C"]
    correctIndex: 1
    explanation: "Why B is correct."
---
```

### Available Components

`LearningObjectives`, `Prerequisites`, `KeyTerms`, `Callout`, `Warning`, `Diagram`, `MermaidDiagram`, `Flashcards`, `QuizBlock`, `WorkedExample`, `Exercise`, `DataTable`, `NarrationHook`, `MindMap`, `Infographic`, `SlideEmbed`, `Citation`, `SourceQualityLabel`, `VerifyClaim`

### Diagram Rules

- Every `Diagram` needs `fallback` text.
- Every image needs meaningful alt text.
- Do NOT encode meaning by color alone.

## Citations and Claims

- Prefer primary, official, or peer-reviewed sources.
- Use `Citation` with `SourceQualityLabel` for supported claims.
- Use `VerifyClaim status="verify"` for plausible but unverified claims.
- Do NOT publish `unsupported` claims as instructional facts.
- Do NOT state current versions, prices, popularity, or laws without fresh evidence.

## Presentations

Marp markdown files in `presentations/`. Name them `NN-descriptive-name.md`. Use `<div class="mermaid">` for Mermaid in presentations (NOT `MermaidDiagram`).

## Naming Conventions

- Module directories: `module-1`, `module-2`, ..., `module-N`
- Lesson files: `NN-descriptive-slug.mdx`
- Tutorial specs: `content/tutorials/descriptive-id.json`
- Presentation files: `NN-descriptive-name.md`
- All slugs and ids: lowercase, hyphen-separated.

## Anti-Patterns

- Do NOT return prose when a prompt asks for JSON.
- Do NOT invent citations.
- Do NOT skip `content/tutorials/*.json` for production tutorials.
- Do NOT hardcode academy display text — it belongs in `academy.config.ts`.
- Do NOT rely on model fluency as a substitute for validation and review.
- Escape `${{ }}` as `\${{ }}` inside CodeBlock template literals.
