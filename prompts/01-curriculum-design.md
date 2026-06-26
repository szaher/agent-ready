# Prompt: Curriculum Design

Use this prompt to design the full module and lesson structure for your academy.

---

## Context

You are designing the curriculum for an interactive learning academy. The platform supports structured lessons (MDX with diagrams and quizzes), an AI chat tutor, and presentation slide decks.

## Input Variables

Replace these before using:

- `{{TOPIC}}` — The subject area (e.g., "LLM Agents", "Kubernetes", "Ray Data")
- `{{AUDIENCE}}` — Target audience (e.g., "ML engineers with Python experience")
- `{{DEPTH}}` — Coverage depth (e.g., "beginner to advanced", "intermediate to expert")
- `{{MODULE_COUNT}}` — Target number of modules (recommended: 5-10)
- `{{LESSONS_PER_MODULE}}` — Target lessons per module (recommended: 3-7)

## Prompt

```
Design a comprehensive curriculum for a "{{TOPIC}}" academy targeting {{AUDIENCE}}, covering {{DEPTH}} levels.

Structure the curriculum into {{MODULE_COUNT}} modules with approximately {{LESSONS_PER_MODULE}} lessons each.

For each module, provide:
1. Module title and one-line description
2. A color from this palette: #68d391, #4fd1c5, #63b3ed, #b794f4, #ed8936, #fc8181, #ecc94b
3. For each lesson within the module:
   - Title and slug (lowercase-hyphenated, prefixed with NN-)
   - One-line description
   - Estimated reading time in minutes (8-15 min range)
   - Diagram types needed: architecture, flowchart, sequence, comparison, state, class
   - Whether it has code examples (hasCode: true/false)
   - Whether it has a quiz (hasQuiz: true/false) — at least 70% of lessons should have quizzes

Design principles:
- Start each module with a "why this matters" lesson
- Progress from concrete examples to abstract concepts
- Each lesson should teach exactly one focused concept
- Later modules should build on earlier ones
- Include at least one hands-on/practical lesson per module
- The final module should cover real-world patterns, troubleshooting, or advanced topics

Output the curriculum as a series of meta.json files, one per module.
Also output a summary table showing: Module | Lessons | Est. Time | Key Topics

Do NOT generate the actual lesson content yet — only the structure.
```

## Expected Output

The LLM should produce:

1. One `meta.json` per module (ready to save to `content/module-N/meta.json`)
2. A curriculum summary table
3. A brief rationale for the module ordering

## Next Step

After the curriculum is designed, use `02-lesson-writing.md` to write each lesson.
