# AI Tutorial Template - Content Author Guide

You are building an interactive educational tutorial repository. Prefer structured JSON, deterministic validation, and human-review checkpoints over uncontrolled prose generation.

## Operating Rules

- Do not modify `src/`, `__tests__/`, root config, or CI files unless explicitly asked to change the platform.
- Author tutorial specs in `content/tutorials/`.
- Author rendered lessons in `content/module-N/`.
- Use the staged prompts in `prompts/` and return JSON first.
- Run the quality gates before considering content ready.
- Mark uncertain factual claims with `VerifyClaim` instead of presenting them as facts.

## Updating An Instance From This Template

When asked to update an academy instance from the template, use the template sync
script instead of manually copying files:

```bash
/path/to/learn-template/scripts/update-template.sh --target /path/to/academy-instance
```

If you are already inside the instance and only have the copied script there,
pass the template checkout explicitly:

```bash
pnpm update:template -- --source /path/to/learn-template
```

Before updating:

- Confirm the target path is the academy instance, not the template checkout.
- Require a clean target git worktree. The script enforces this for git repos.
- Start with `--dry-run` if the target has valuable local customization.

The updater must preserve academy-owned files:

- `content/`
- `presentations/`
- `academy.config.ts`
- `.env*`
- `docker-compose.yml`
- local dependency/build output

Do not overwrite those paths manually unless the user explicitly asks for a
platform migration that changes instance-owned files. After the update, review
the diff and run `pnpm install`, `pnpm validate`, `pnpm test`, `pnpm lint`, and
`pnpm build` in the target instance when feasible.

## Required Flow

1. Define the tutorial with `prompts/01-curriculum-design.md`.
2. (Optional) Select content style in the tutorial spec inputs:
   - **Voice** (pick one): `conversational`, `academic`, `systematic`, `narrative`, `minimalist`.
   - **Approaches** (pick one or more): `socratic`, `problem-based`, `hands-on`, `analogical`, `visual-first`, `challenge-based`.
   - **Generation mode**: `sequential` (default, lessons build on each other) or `parallel` (lessons are independent).
3. Save a validated `TutorialSpec` JSON file in `content/tutorials/`. Use `schemaVersion: "1.1.0"` for specs with enhancement fields, `"1.0.0"` for legacy specs.
4. Plan sources and claim coverage before writing lessons.
5. Plan multimedia with `prompts/08-multimedia-planning.md` after lesson outlines are ready.
6. Generate lesson, assessment, and artifact JSON with `prompts/02-lesson-writing.md`, `prompts/03-quiz-creation.md`, and `prompts/04-presentation-creation.md`.
7. Move approved MDX into `content/module-N/`.
8. Run `pnpm validate`, `pnpm test`, `pnpm lint`, and `pnpm build`.
9. Complete human review for factuality, pedagogy, accessibility, localization, and all `verify` claims.

Use `prompts/07-repair-invalid-output.md` when model output fails schema, MDX, citation, or accessibility checks.

## Repository Map

```text
academy.config.ts              # Academy display and tutor configuration
content/
  module-1/
    meta.json                  # Module metadata and lesson manifest
    01-sample-lesson.mdx       # Rendered lesson content
  tutorials/
    sample-tutorial.json       # TutorialSpec 1.0.0 fixture
    sample-enhanced-tutorial.json  # TutorialSpec 1.1.0 fixture with enhancements
docs/
  architecture.md              # System architecture
  authoring-flow.md            # End-to-end authoring workflow
prompts/
  01-curriculum-design.md      # TutorialSpec generation
  02-lesson-writing.md         # Lesson artifact generation
  03-quiz-creation.md          # Assessment generation
  04-presentation-creation.md  # Rich artifact generation
  05-content-quality.md        # Audit prompt
  07-repair-invalid-output.md  # Repair prompt
  08-multimedia-planning.md    # Multimedia blueprint per lesson
  schemas/
    tutorial-spec.schema.json  # JSON Schema contract
scripts/
  validate.mjs                 # Deterministic quality gates
src/                           # Platform code
```

## Tutorial Specification

Every production tutorial should have a `TutorialSpec` JSON document. It captures:

- Audience, prerequisites, learning objectives, scope, and non-goals.
- Lesson sequence, estimated duration, difficulty, and references.
- Concepts, misconceptions, worked examples, exercises, and answers.
- Formative assessment, mastery criteria, recap, and next steps.
- Accessibility and localization metadata.
- (v1.1.0) Content style (voice, instructional approaches, generation mode).
- (v1.1.0) Gamification, adaptive paths, spaced repetition, microlearning, project capstones.
- (v1.1.0) UDL framework, collaborative learning, multimedia plans, scaffolding, metacognition.

The TypeScript contract lives in `src/types/tutorial.ts`; the JSON Schema prompt contract lives in `prompts/schemas/tutorial-spec.schema.json`.

Specs using `schemaVersion: "1.0.0"` are always valid. Enhancement fields require `schemaVersion: "1.1.0"`. The validator accepts both versions.

## Module Metadata

Every module directory needs `meta.json`. The `id` field must match the directory number.

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
      "diagramTypes": ["architecture", "flowchart"],
      "hasCode": true,
      "hasQuiz": true
    }
  ]
}
```

Rules:

- `slug` must exactly match the MDX filename without extension.
- Lessons appear in the order listed.
- `diagramTypes`, `hasCode`, and `hasQuiz` are informational but should match the content.
- Use colors from `academy.config.ts` unless there is a strong reason to add a new one.

## MDX Lessons

Use `##` for lesson sections. Do not use `#` in lesson bodies because the page title is rendered by the app.

Frontmatter quizzes are supported:

```yaml
---
title: "Lesson Title"
quiz:
  - question: "What does validation catch?"
    options:
      - "Only grammar"
      - "Structural and content-gate defects"
      - "All factual errors"
    correctIndex: 1
    explanation: "Validation catches deterministic defects, while humans still review factuality."
---
```

### Learning Components

Use these reusable MDX components:

- `LearningObjectives`
- `Prerequisites`
- `KeyTerms`
- `Callout`
- `Warning`
- `Diagram`
- `MermaidDiagram`
- `Flashcards`
- `QuizBlock`
- `WorkedExample`
- `Exercise`
- `DataTable`
- `NarrationHook`
- `MindMap`
- `Infographic`
- `SlideEmbed`
- `Citation`
- `SourceQualityLabel`
- `VerifyClaim`

Example:

```mdx
<LearningObjectives items={[
  "Explain why schema validation runs before human review.",
  "Classify generated claims as verified, verify, or unsupported."
]} />

<Diagram
  chart={`graph LR
    Spec[Tutorial Spec] --> Prompt[Structured Prompt]
    Prompt --> Validate[Quality Gates]
    Validate --> Review[Human Review]
  `}
  fallback="Tutorial specs feed structured prompts, validation gates, and human review."
  caption="Generation artifacts move through validation before publication."
/>

<VerifyClaim status="verify">
  Claims about current tool popularity require recent source review.
</VerifyClaim>
```

## Citation and Claim Rules

- Prefer primary, official, or peer-reviewed sources.
- Every factual claim that depends on a source should have a citation or a verification state.
- Use `Citation` with source-quality labels for supported claims.
- Use `VerifyClaim status="verify"` for plausible but unverified claims.
- Do not publish `unsupported` claims as instructional facts.
- Do not state current versions, prices, popularity, laws, or recent events without fresh evidence.

## Diagrams and Accessibility

- Every `Diagram` needs fallback text.
- Every image needs meaningful alt text.
- Every slide embed needs a title and fallback link.
- Narration hooks should mirror visible content and not introduce hidden facts.
- Do not encode meaning by color alone.
- Keep tables readable and provide captions when context is not obvious.

## Presentation Decks

Presentations are Marp markdown files in `presentations/`. Name them `NN-descriptive-name.md`.

Use `<div class="mermaid">` for Mermaid in presentations. Use `MermaidDiagram` or `Diagram` only in MDX lessons.

```markdown
---
marp: true
theme: academy
header: 'Your Academy Name'
footer: 'Deck Title'
paginate: true
---

<!-- _class: lead -->
<!-- _paginate: false -->

# Presentation Title

## Subtitle
```

## Quality Gates

Run these before review:

```bash
pnpm validate
pnpm test
pnpm lint
pnpm build
```

`pnpm validate` checks:

- Tutorial spec shape and cross-references.
- MDX compilation.
- Broken local links and malformed URLs.
- Citation ids against tutorial references.
- Basic accessibility requirements for images, diagrams, and embeds.
- Duplicate paragraphs.
- Risky unsupported-claim wording outside `VerifyClaim`.
- (v1.1.0) Content style values against canonical voices, approaches, and generation modes.
- (v1.1.0) Lesson dependency graph: unknown ids, self-references, cycles.
- (v1.1.0) Generation mode compliance: sequential chain integrity, parallel independence.
- (v1.1.0) Artifact descriptor types, statuses, and accessibility fallback text.
- (v1.1.0) Gamification integrity: badge existence, achievement lesson references.
- (v1.1.0) Adaptive path and project capstone cross-references.
- (v1.1.0) UDL framework coverage minimums.

## Naming Conventions

- Module directories: `module-1`, `module-2`, ..., `module-N`
- Lesson files: `NN-descriptive-slug.mdx`
- Tutorial specs: `content/tutorials/descriptive-id.json`
- Presentation files: `NN-descriptive-name.md`
- Slugs and ids use lowercase words separated by hyphens.

## Anti-Patterns

- Do not return prose when a prompt asks for JSON.
- Do not invent citations.
- Do not skip `content/tutorials/*.json` for production tutorials.
- Do not use `#` headings inside lesson MDX bodies.
- Do not use `MermaidDiagram` in presentation decks.
- Do not use `<div class="mermaid">` in MDX lessons.
- Do not hardcode academy display text when it belongs in `academy.config.ts`.
- Do not rely on model fluency as a substitute for validation and review.

## SOTA Educational Practices

The tutorial spec (v1.1.0) supports optional educational enhancements. These are modeled as authoring metadata — runtime features like point tracking or adaptive routing require separate platform work.

| Feature | Authoring-Ready | Needs Runtime Support |
|---------|----------------|----------------------|
| **Gamification** — badges, points, streaks, achievements | Config in spec | Points state, badge UI, persistence |
| **Adaptive paths** — branching lesson sequences by difficulty | Path definitions in spec | Diagnostic signals, route selection |
| **Spaced repetition** — configurable review intervals | Intervals and card count in spec | Deck format, review scheduler |
| **Microlearning** — short-form digest modules | Segmentation config in spec | Session segmentation, resume state |
| **Project capstones** — culminating projects with rubrics | Spec with deliverables and rubric | Submission and grading UI |
| **Collaborative learning** — peer review, group activities | Config in spec | Backend integration, identity |
| **Scaffolding** — hints, differentiated paths | Config per lesson | Adaptive hint UI |
| **UDL framework** — multiple representations, actions, engagement | Coverage metadata | Renderer support per modality |
| **Metacognition** — self-assessment, reflection, goal-setting | Strategy prompts per lesson | Learner journaling UI |
| **Interactive simulations** — dynamic explorations | Artifact descriptors | Component registry, sandboxing |

New multimedia types: `timeline`, `comparison-matrix`, `decision-tree`, `concept-map`, `interactive-simulation`. Use `DataTable` for comparison matrices. Use `MermaidDiagram` for decision-trees and concept-maps. Timeline and interactive-simulation require external authoring tools.

## Optional Book Export

The book export scripts remain available for publishing lesson content:

```bash
bash scripts/build-book.sh
bash scripts/build-book.sh --formats pdf,epub,html
```

Prerequisites include `pandoc`, `xelatex`, and `mermaid-filter`. See `prompts/06-book-conversion.md` for the book toolchain details.
