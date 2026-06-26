# Prompt: Lesson Writing

Use this prompt to write individual MDX lesson files.

---

## Context

You are writing a lesson for an interactive academy. Each lesson is an `.mdx` file with YAML frontmatter and a body that uses custom React components for diagrams and code.

## Input Variables

- `{{TOPIC}}` — The lesson's specific topic
- `{{MODULE_TITLE}}` — The parent module name (for context)
- `{{LESSON_TITLE}}` — The lesson title from meta.json
- `{{DIAGRAM_TYPES}}` — Which diagram types to include (from meta.json)
- `{{HAS_CODE}}` — Whether to include code examples
- `{{HAS_QUIZ}}` — Whether to include quiz questions
- `{{CODE_LANGUAGE}}` — Primary code language (e.g., "python")
- `{{PRIOR_LESSONS}}` — Titles of lessons that come before this one (for continuity)

## Prompt

```
Write an MDX lesson file for "{{LESSON_TITLE}}" in the "{{MODULE_TITLE}}" module.

Topic: {{TOPIC}}
This lesson follows: {{PRIOR_LESSONS}}

FORMATTING RULES — follow these exactly:

1. FRONTMATTER: Start with YAML frontmatter containing `title` and optionally `quiz`
2. HEADINGS: Use ## for sections (never # — that's reserved for the page title)
3. BOLD: First occurrence of every key term should be **bold**
4. SECTIONS: Start with an Overview, end with a Summary

COMPONENTS — use these exact syntaxes:

MermaidDiagram (for {{DIAGRAM_TYPES}} diagrams):
<MermaidDiagram chart={`graph TD
    A[Node] --> B[Node]
    subgraph Group["Label"]
        B --> C[Node]
    end
    style Group fill:#ebf8ff,stroke:#3182ce
`} />

CodeBlock (if hasCode is true):
<CodeBlock code={`# your code here
def example():
    pass
`} language="{{CODE_LANGUAGE}}" filename="example.py" />

QUIZ (if hasQuiz is true):
- Include 2-4 questions in the frontmatter quiz array
- Use 3-4 plausible options per question
- Vary correctIndex (don't always use 0)
- Questions should test understanding, not memorization

CONTENT GUIDELINES:
- Lead with WHY this concept matters before HOW it works
- Use at least one MermaidDiagram to illustrate architecture or flow
- Include at least one CodeBlock with a realistic, runnable example (if hasCode)
- Use bulleted lists for key takeaways
- Use blockquotes (>) for tips or important warnings
- Target 8-15 minutes reading time
- Use analogies to connect new concepts to familiar ones
- Reference prior lessons naturally: "As we saw in [prior lesson]..."

OUTPUT: The complete .mdx file content, ready to save.
```

## Example Output Structure

```mdx
---
title: "Lesson Title"
quiz:
  - question: "..."
    options: ["A", "B", "C", "D"]
    correctIndex: 2
---

## Overview

Opening paragraph explaining why this matters...

## Core Concept

Explanation with **bold key terms**...

<MermaidDiagram chart={`...`} />

## Working Example

<CodeBlock code={`...`} language="python" filename="example.py" />

## Key Takeaways

- Point 1
- Point 2
- Point 3

> **Tip:** Important insight here.

## Summary

Wrap-up connecting to the next lesson...
```

## Next Step

After writing lessons, use `03-quiz-creation.md` to add or improve quizzes.
