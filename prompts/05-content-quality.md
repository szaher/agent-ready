# Prompt: Content Quality Review

Use this prompt to review and improve content before finalizing.

---

## Self-Edit Checklist

Run through this checklist for every lesson and presentation before considering it done.

### Structure

- [ ] Lesson starts with a "why this matters" overview
- [ ] Sections flow logically — each builds on the previous
- [ ] Lesson ends with a summary that connects to what's next
- [ ] Headings use `##` (never `#` in lesson body)
- [ ] Slug in filename matches slug in meta.json

### Diagrams

- [ ] At least one diagram per lesson that has `diagramTypes` in meta.json
- [ ] Diagrams use `<MermaidDiagram>` in MDX (not `<div class="mermaid">`)
- [ ] Diagrams use `<div class="mermaid">` in presentations (not `<MermaidDiagram>`)
- [ ] Diagrams have labeled nodes (not just A, B, C)
- [ ] Diagrams use subgraphs to group related concepts
- [ ] Diagrams use style directives for color coding

### Code

- [ ] Code examples are realistic and runnable
- [ ] Code uses the correct language from academy.config.ts
- [ ] Code blocks use `<CodeBlock>` component in MDX
- [ ] Code blocks use fenced markdown in presentations
- [ ] Variable/function names are descriptive
- [ ] No placeholder comments like `# TODO` or `# implement this`

### Quizzes

- [ ] 2-4 questions per lesson
- [ ] correctIndex values are varied across questions
- [ ] All distractors are plausible
- [ ] Questions test understanding, not memorization
- [ ] No "All of the above" or "None of the above"

### Writing Quality

- [ ] First occurrence of each key term is **bold**
- [ ] No walls of text — break up with diagrams, lists, code
- [ ] Sentences are concise (under 25 words preferred)
- [ ] Analogies connect new concepts to familiar ones
- [ ] No jargon without definition

## Banned Phrases

Remove or rewrite if you find these:

| Phrase | Why | Replace With |
|--------|-----|-------------|
| "simply" / "just" / "easily" | Dismisses complexity | Remove or explain the steps |
| "obviously" / "clearly" | Assumes prior knowledge | State the fact directly |
| "as everyone knows" | Excludes beginners | Remove entirely |
| "it's worth noting that" | Filler | State the thing directly |
| "in order to" | Verbose | "to" |
| "utilize" | Pretentious | "use" |
| "leverage" (as verb) | Jargon | "use" or more specific verb |
| "at the end of the day" | Cliche | Remove or state the conclusion |

## Humanization Tips

Content should read like a knowledgeable colleague explaining over coffee, not a textbook.

1. **Use "you" and "we"** — "You'll notice that..." not "One can observe that..."
2. **Acknowledge difficulty** — "This part is tricky because..." not pretending it's easy
3. **Share the reasoning** — "We use X here because Y" not just "Use X"
4. **Add context** — "In production, you'd also want..." shows real-world awareness
5. **Be specific** — "This reduces memory usage by ~40%" not "This improves performance"

## Prompt for Quality Pass

```
Review the following lesson content and improve it:

1. Replace any banned phrases (see table above)
2. Ensure first occurrence of key terms is **bold**
3. Check that diagrams have descriptive node labels
4. Verify code examples are realistic and complete
5. Confirm quiz correctIndex values are varied
6. Add analogies where concepts are abstract
7. Break up any paragraph longer than 4 sentences

Output the improved content with a brief changelog of what you fixed.
```
