# Agent Ready Specification

The Agent Ready Specification is the **machine-readable contract** for agent
readiness. It turns the principles taught in this repository's course into
versioned, deterministic requirements that tools can assess a repository
against, with no LLM judgment.

- The **course** (`content/`) is human-facing. It explains why and how, with
  examples, nuance, and judgment.
- The **spec** (`spec/`) is normative. It defines what is checked, how it is
  checked, and what maturity level the result implies.

The spec is not generated from the course and the course is not generated from
the spec. Each rule cites the lessons it derives from (`sources`), and CI checks
that those lessons exist.

```text
spec/
├── README.md              this document
├── v1/                    authored sources for spec major version 1
│   ├── spec.yaml          metadata, closed vocabularies, pillars, dimensions, includes
│   ├── maturity.yaml      maturity levels 0–4 and their semantics
│   ├── evidence.yaml      evidence vocabulary (what can be observed, and how)
│   ├── context.yaml       Context pillar rules
│   ├── conventions.yaml   Conventions pillar rules
│   ├── constraints.yaml   Constraints pillar rules
│   ├── feedback.yaml      Feedback Loops pillar rules
│   ├── security.yaml      rules carrying the security dimension
│   ├── performance.yaml   rules carrying the performance dimension
│   └── schema.json        JSON Schema for the bundle and each source file
├── dist/
│   └── agent-ready-spec-<version>.json   generated canonical bundle (the contract)
└── tools/agentReadySpec.mjs              loader, validator, canonical bundler
```

```bash
pnpm spec:check   # validate sources and verify spec/dist matches them (CI gate)
pnpm spec:build   # validate and regenerate spec/dist after editing YAML
```

## Model

### Pillars and dimensions

Every rule belongs to exactly one of the four Agent Ready pillars:

| Pillar | Question it answers |
|---|---|
| `context` | What is this project, how is it structured, and why? |
| `conventions` | What patterns does the team follow? |
| `constraints` | What must an agent not do? |
| `feedback` | How does an agent verify its own work? |

`security` and `performance` are **dimensions**, not pillars. They are
cross-cutting views: a rule may carry at most one dimension in addition to its
pillar. For example, `constraints.secrets.untracked` is a constraint with the
security dimension. Rules with a dimension are authored in that dimension's
file. Adding a fifth pillar would be a breaking (major) change and needs a
documented rationale.

### Rules

```yaml
- id: feedback.tests.available        # stable; prefix is the pillar
  pillar: feedback
  title: Runnable test suite
  description: The repository provides a discoverable single test command.
  rationale: Why this matters (shown by `explain`).
  required_from: foundational          # level from which the rule is in scope
  severity: required                   # required | recommended | advisory
  applies_when:                        # optional; false => not-applicable
    any: [project.language]
  evidence:                            # any / all / none, nestable
    any: [command.test]
  evaluation:
    on_missing: fail                   # fail | unknown (+ unknown_reason)
  depends_on: []                       # optional; prerequisite rules
  remediation:
    classification: assisted           # automatable | assisted | human-required
    summary: Expose the test suite through one command.
    # decision: ...                    # required for human-required
  sources:
    - content/module-1/03-agent-ready-maturity-model.mdx
```

### Statuses

| Status | Meaning |
|---|---|
| `pass` | The rule applies and its evidence expression is satisfied. |
| `fail` | The rule applies, evidence is missing, and the rule declares `on_missing: fail`. |
| `unknown` | The rule applies but the outcome cannot be established safely. Either the rule declares `on_missing: unknown`, or the assessor does not support an evidence type the rule needs. |
| `not-applicable` | The rule's `applies_when` expression is not satisfied. |

`unknown` is never reported as `fail`. A rule declares `on_missing: unknown`
only when absence of evidence does not show absence of the practice, for
example architecture boundaries that are team policy, or permissions enforced
at organization scope. Such rules must be `human-required`: a tool must not
invent the policy.

## Normative vs advisory

| Severity | Gates maturity? | Assessor behavior |
|---|---|---|
| `required` | Yes, from `required_from` upward | A blocking requirement for that level |
| `recommended` | No | Listed as a recommended improvement when planning toward that level |
| `advisory` | No | Informational; optional follow-up |

Only concepts that are **deterministic or explicitly evidence-backed** became
rules. The course also contains material that deliberately did *not* become a
machine rule:

| Course material | Why it is not a v1 rule |
|---|---|
| Effectiveness benchmarks (completion rate, iterations, intervention rate) | Educational targets. They describe outcomes, not repository properties. |
| CLAUDE.md length targets (60/80/100 lines) | The course gives different numbers in different lessons. Only a generous advisory-level upper bound (100) is used, as a recommendation. |
| Test-suite speed ("under 2 minutes"), coverage of critical paths | Requires executing the project, but assessment is read-only. |
| Directory naming and structure quality, comment quality, actionable errors | Subjective or team-specific. |
| Branch protection, identifiable agent commits, CI parity for agent PRs, transcript retention | Not observable from repository content (needs a hosting API or process evidence). |
| Instruction freshness ("regularly updated") | Time-dependent. The same repository would assess differently on different days. |
| Model right-sizing, batching, session focus | Agent usage practices, not repository properties. |

## Maturity semantics

The five course levels are preserved:

| Rank | Level | Required rules (v1) |
|---|---|---|
| 0 | `unaware` | none (the floor) |
| 1 | `foundational` | `context.readme`, `context.readme.setup`, `conventions.tooling`, `feedback.build.available`, `feedback.tests.available` |
| 2 | `structured` | `context.agent_instructions`, `context.agent_instructions.commands`, `context.architecture`, `conventions.documented`, `conventions.enforced`, `constraints.documented`, `constraints.secrets.ignored`, `constraints.secrets.untracked`, `constraints.mcp.no_inline_secrets`, `feedback.tests.present`, `feedback.typecheck` |
| 3 | `optimized` | `context.agent_instructions.hierarchical`, `context.task_workflows`, `constraints.architecture_boundaries` |
| 4 | `autonomous` | `context.contribution_workflow`, `conventions.ci_enforced`, `feedback.ci.tests`, `feedback.ci.security`, `feedback.agent_effectiveness` |

Maturity is **requirement-based and cumulative**:

> A repository is at level N (N ≥ 1) only when every `required` rule whose
> `required_from` rank is ≤ N has status `pass` or `not-applicable`. A required
> rule with status `fail` or `unknown` blocks its level and every higher level.

Example: if `feedback.typecheck` fails, the repository cannot be `structured`,
however many other rules pass. Assessors may show counts or percentages as
diagnostics, but those never determine the level. `unknown` blocks exactly
like `fail`: a level is claimed only on positive evidence.

`depends_on` expresses remediation order (fix the README before its setup
section). It does not change evaluation. A dependency is never in scope at a
higher level than its dependent, and dependencies are acyclic (both are
enforced by validation).

## Evidence model

Evidence is a fact established deterministically from **repository content and
version-control metadata only**. Workstation state (installed tools, local
metrics, credentials, network) is never evidence. This gives the core guarantee:

> The same repository content and the same spec version produce the same assessment.

Each evidence type has an id (`<category>.<name>`), a category, and a detection:

| Detection | Semantics |
|---|---|
| `path` | Glob(s) relative to the repository root. `type` is `file`, `directory`, or `any`. `scope: tracked` limits matching to version-controlled files (for example committed lockfiles or secrets). |
| `heading` | A Markdown ATX heading (`#`…`######`) in the files matched by the referenced `path` evidence (`in`) or globs (`paths`) matches a pattern. |
| `content` | A single line in those files matches a pattern. |
| `derived` | A precise prose definition for facts that need ecosystem knowledge, for example discovering the test command from `package.json`, a Makefile, or `go.mod`. |

Categories: `file`, `documentation`, `agent`, `command`, `project`, `config`,
`ci`, `security`, `mcp`, `metrics`. Glob semantics, the ignored-directory list,
and the portable regular-expression subset (case-insensitive, no lookbehind,
inline flags, or backreferences, so JavaScript and Python agree) are defined in
`spec.yaml` under `path_matching`.

Evidence expressions combine ids with `any`, `all`, and `none`, and can be
nested. `none` expresses prohibitions, for example
`constraints.secrets.untracked` passes when `security.tracked_secret_files` is
absent. Implications are written as `any: [{none: [A]}, B]`, meaning "if A then B".

Heading and content detections are deliberately simple signals: they show that
a section exists, not that it is good. Assessors should report the matching
heading or line as evidence so a human can judge quality.

## Versioning policy

The spec uses semantic versioning. The source directory is the major version
(`v1/` holds every `1.x.y`).

| Change | Version bump |
|---|---|
| Anything that can lower an existing repository's maturity or change rule semantics: adding a `required` rule, raising a rule's severity, lowering its `required_from`, narrowing evidence (fewer ways to pass), widening `applies_when` (the rule applies to more repositories), removing or renaming an id, changing the closed vocabularies | **major** (new `vN/` directory) |
| Changes that can only keep or raise maturity, or add information: new `recommended`/`advisory` rules, new evidence types, widening evidence (more ways to pass), narrowing `applies_when` (more repositories become not-applicable), new optional fields | **minor** |
| Wording, rationale, sources, documentation | **patch** |

Rule and evidence ids are stable within a major version. `schema_version`
versions the document format and changes only with incompatible structure.

## The bundle and integrity

`pnpm spec:build` assembles the sources into one canonical JSON document,
`spec/dist/agent-ready-spec-<version>.json`. It has a fixed `document_type`
(`agent-ready.spec`), recursively sorted keys, id-sorted rules and evidence, and
a trailing newline. CI fails if the committed bundle drifts from the sources.

Because the serialization is canonical, the bundle's SHA-256 identifies a spec
version exactly. Consumers pin the version **and** the digest. Future
signed or remotely resolved specs can use the same digest without changing the
format.

## How Agentic Dev consumes the spec

[Agentic Dev](https://github.com/szaher/agentic-dev) is the reference assessor
(`agentic ready assess|explain|plan`):

1. It vendors a copy of `spec/dist/agent-ready-spec-<version>.json` into its
   distribution, together with a pin recording `spec_version`, `sha256`, and
   the agent-ready source commit. Assessment works offline, with no YAML
   parser and no network.
2. On load it verifies the digest and rejects documents whose `schema_version`
   or `document_type` it does not support.
3. It collects evidence through its own repository inspection, evaluates rules
   exactly as described above, and reports the spec name and version in every
   result.
4. Remediation classification guides future tooling: `automatable` items may
   be applied by tools, `assisted` items may be scaffolded for human
   completion, and `human-required` items are only ever described.

The spec stays independent of any implementation. Another assessor needs only
the bundle and this document.

## Changing the spec

1. Edit the YAML under `spec/v1/`, keeping rules and evidence sorted by id.
2. Cite the course lessons that motivate the change in `sources`.
3. Bump `spec_version` according to the versioning policy.
4. Run `pnpm spec:build`, then `pnpm test`.
5. Commit the sources and the regenerated bundle together.
