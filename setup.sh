#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "==================================="
echo "  Academy Template Setup"
echo "==================================="
echo ""

read -rp "Academy name (e.g., LLM Agents Academy): " ACADEMY_NAME
read -rp "Slug (lowercase, no spaces, e.g., llm-agents): " ACADEMY_SLUG
read -rp "Description (one line): " ACADEMY_DESC
read -rp "Tagline (displayed on home page): " ACADEMY_TAGLINE
read -rp "Primary code language (e.g., python, typescript): " CODE_LANG
read -rp "Topic for AI tutor (e.g., LLM agents and agentic AI): " TUTOR_TOPIC
read -rp "Accent color hex (default #63b3ed): " ACCENT_COLOR
ACCENT_COLOR="${ACCENT_COLOR:-#63b3ed}"

echo ""
echo "Configuring: $ACADEMY_NAME ($ACADEMY_SLUG)"
echo ""

cat > academy.config.ts << CONFIGEOF
export const academy = {
  name: "${ACADEMY_NAME}",
  slug: "${ACADEMY_SLUG}",
  description: "${ACADEMY_DESC}",
  tagline: "${ACADEMY_TAGLINE}",

  tutor: {
    systemPrompt: \`You are an expert tutor for ${TUTOR_TOPIC}.

Your role:
- Explain concepts clearly with visual diagrams and code examples
- Use \\\`\\\`\\\`mermaid code blocks for architecture diagrams, flowcharts, and sequence diagrams
- Use \\\`\\\`\\\`${CODE_LANG} code blocks for code examples
- Break complex topics into digestible pieces
- Use analogies to connect new concepts to familiar ones
- Be encouraging and patient

When generating diagrams, always use mermaid syntax. For example:
\\\`\\\`\\\`mermaid
graph TD
    A[Input] --> B[Process]
    B --> C[Output]
\\\`\\\`\\\`\`,
    codeLanguage: "${CODE_LANG}",
    chatPlaceholder: "Ask about ${TUTOR_TOPIC}...",
    chatWelcome: "Ask anything about ${TUTOR_TOPIC}",
    chatSubtext: "I'll explain with diagrams and code examples",
  },

  accentColor: "${ACCENT_COLOR}",

  moduleColors: [
    "#68d391", "#4fd1c5", "#63b3ed", "#b794f4",
    "#ed8936", "#fc8181", "#ecc94b",
  ],

  presentation: {
    theme: "academy",
    header: "${ACADEMY_NAME}",
  },
} as const;

export const storageKeys = {
  progress: \`\${academy.slug}-progress\`,
  notes: \`\${academy.slug}-notes\`,
  chat: \`\${academy.slug}-chat\`,
  theme: \`\${academy.slug}-theme\`,
} as const;
CONFIGEOF

echo "  [ok] academy.config.ts"

if command -v jq &> /dev/null; then
  tmpfile=$(mktemp)
  jq --arg name "$ACADEMY_SLUG" '.name = $name' package.json > "$tmpfile" && mv "$tmpfile" package.json
  echo "  [ok] package.json name -> $ACADEMY_SLUG"
else
  sed -i.bak "s/\"name\": \"academy-template\"/\"name\": \"${ACADEMY_SLUG}\"/" package.json
  rm -f package.json.bak
  echo "  [ok] package.json name -> $ACADEMY_SLUG (sed)"
fi

sed -i.bak "s/academy:/${ACADEMY_SLUG}:/" docker-compose.yml
rm -f docker-compose.yml.bak
echo "  [ok] docker-compose.yml service -> $ACADEMY_SLUG"

echo ""
echo "==================================="
echo "  Setup complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "  1. pnpm install"
echo "  2. Design your curriculum (see prompts/01-curriculum-design.md)"
echo "  3. Write lessons in content/module-N/"
echo "  4. Create presentations in presentations/"
echo "  5. pnpm dev to preview"
echo ""
