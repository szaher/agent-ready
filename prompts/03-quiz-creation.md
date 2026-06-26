# Prompt: Quiz Creation

Use this prompt to create or improve quiz questions for lessons.

---

## Context

Quizzes are defined in the YAML frontmatter of each `.mdx` lesson file. They appear as an interactive multiple-choice section at the bottom of the lesson.

## Format Reference

```yaml
---
title: "Lesson Title"
quiz:
  - question: "What is the primary benefit of X?"
    options:
      - "Option A — plausible but wrong"
      - "Option B — the correct answer"
      - "Option C — common misconception"
      - "Option D — partially correct"
    correctIndex: 1
  - question: "Which statement about Y is true?"
    options:
      - "Statement 1"
      - "Statement 2"
      - "Statement 3"
    correctIndex: 0
---
```

## Input Variables

- `{{LESSON_TITLE}}` — The lesson being quizzed
- `{{KEY_CONCEPTS}}` — List of concepts covered in the lesson
- `{{QUESTION_COUNT}}` — Number of questions (recommended: 2-4)

## Prompt

```
Create {{QUESTION_COUNT}} quiz questions for the lesson "{{LESSON_TITLE}}".

Key concepts to test: {{KEY_CONCEPTS}}

RULES:

1. FORMAT: Output as YAML quiz array (ready to paste into frontmatter)
2. OPTIONS: 3-4 options per question
3. CORRECT INDEX: Vary correctIndex across questions — use 0, 1, 2, and 3
   Example for 4 questions: correctIndex values of 1, 0, 3, 2
4. DIFFICULTY: Mix easier and harder questions
5. DISTRACTORS: Every wrong answer must be plausible
   - BAD distractor: "42" (obviously wrong)
   - GOOD distractor: "Reduces latency by caching at the edge" (sounds right but isn't)
6. QUESTION TYPES: Mix these styles:
   - "What is the purpose of X?" (conceptual)
   - "Which of the following is true about Y?" (factual)
   - "What happens when Z?" (applied reasoning)
   - "Which is NOT a characteristic of W?" (negative)
7. AVOID:
   - "All of the above" / "None of the above"
   - Questions that can be answered without reading the lesson
   - Trick questions or ambiguous wording
   - Questions about syntax minutiae

OUTPUT: Just the YAML quiz array, nothing else.
```

## Quality Checklist

After generating quizzes, verify:

- [ ] correctIndex values are varied (not all the same)
- [ ] No correctIndex exceeds the options array length
- [ ] Each distractor is plausible (someone who didn't read carefully might pick it)
- [ ] Questions test understanding, not memorization
- [ ] At least one question requires applying a concept (not just recalling a fact)
