# Prompt: Presentation Creation

Use this prompt to create Marp slide decks from lesson content.

---

## Context

Presentations are Marp markdown files that compile to HTML. They use the Red Hat branded `academy` theme with support for lead slides, section dividers, tables, code blocks, Mermaid diagrams, callout boxes, and speaker notes.

## Input Variables

- `{{DECK_TITLE}}` — The presentation title
- `{{ACADEMY_NAME}}` — The academy name (for the header)
- `{{TOPICS}}` — List of topics/lessons this deck covers
- `{{SLIDE_COUNT}}` — Target number of slides (recommended: 12-20)

## Prompt

```
Create a Marp presentation deck titled "{{DECK_TITLE}}" for the {{ACADEMY_NAME}} academy.

Topics to cover: {{TOPICS}}
Target: approximately {{SLIDE_COUNT}} slides.

REQUIRED STRUCTURE:

1. Start with frontmatter:
---
marp: true
theme: academy
header: '{{ACADEMY_NAME}}'
footer: '{{DECK_TITLE}}'
paginate: true
---

2. Immediately after frontmatter, add the Mermaid script:
<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: true, theme: "base", themeVariables: { primaryColor: "#e0f0ff", primaryTextColor: "#151515", primaryBorderColor: "#0066cc", lineColor: "#0066cc", secondaryColor: "#daf2f2", tertiaryColor: "#f2f2f2", noteBkgColor: "#fef0f0", noteTextColor: "#151515", fontFamily: "Red Hat Text, sans-serif" }});
</script>

3. SLIDE TYPES — use all of these:

TITLE SLIDE (first slide):
<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->
# Title
## Subtitle

SECTION DIVIDER (between major sections):
<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->
# Section Title
## Description

CONTENT WITH BULLETS:
# Slide Title
- **Key point** -- explanation
- **Another point** -- details

CONTENT WITH TABLE:
# Comparison
| Feature | A | B |
|---------|---|---|
Use <span class="vs-good">Good</span>, <span class="vs-bad">Bad</span>, <span class="vs-neutral">Neutral</span> for colored values.

CONTENT WITH DIAGRAM:
# Architecture
<div class="mermaid">
graph LR
    A[Input] --> B[Process] --> C[Output]
</div>

CONTENT WITH CODE:
Use standard fenced code blocks (```python ... ```)

CALLOUT BOX:
<div class="callout">
**Tip:** Important takeaway.
</div>

BLOCKQUOTE:
> Key insight or quote.

CLOSING SLIDE (last slide):
<!-- _class: lead -->
# Questions?
## Thank you

4. SLIDE SEPARATOR: Use --- on its own line between slides.

5. SPEAKER NOTES: Add <!-- Speaker note: ... --> to every content slide.

CONTENT GUIDELINES:
- One idea per slide
- Maximum 5-6 bullet points per slide
- Use diagrams instead of walls of text
- Include at least 2 Mermaid diagrams
- Include at least 1 code example
- Include at least 1 comparison table
- End each section with a key takeaway or summary slide

OUTPUT: The complete .md file, ready to save as presentations/NN-name.md
```

## Build Commands

After creating the deck:

```bash
cd presentations
bash fix-mermaid.sh    # Convert ```mermaid blocks to <div> (if any)
bash build.sh          # Build to HTML
open dist/NN-name.html # Preview in browser
```
