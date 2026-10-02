// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DIST_DIR,
  assemble,
  bundleFileName,
  canonicalJson,
  expressionRefs,
  loadSource,
  sha256,
  validateSource,
} from "../../spec/tools/agentReadySpec.mjs";

type Rule = Record<string, unknown> & { id: string };
type RuleFile = { name: string; data: { kind: string; scope: Record<string, string>; rules: Rule[] } };
type Source = ReturnType<typeof loadSource>;

function rule(id: string, overrides: Record<string, unknown> = {}): Rule {
  const pillar = id.split(".")[0];
  return {
    id,
    pillar,
    title: `Title for ${id}`,
    description: "Description.",
    rationale: "Rationale.",
    required_from: "foundational",
    severity: "required",
    evidence: { any: ["file.readme"] },
    evaluation: { on_missing: "fail" },
    remediation: { classification: "automatable", summary: "Do the thing." },
    sources: ["content/module-1/03-agent-ready-maturity-model.mdx"],
    ...overrides,
  };
}

function ruleFile(name: string, scope: Record<string, string>, rules: Rule[]): RuleFile {
  return { name, data: { kind: "agent-ready.rules", scope, rules } };
}

/** A minimal, valid rule set that covers every pillar and gates every level. */
function coveringRules(): RuleFile[] {
  return [
    ruleFile("context.yaml", { pillar: "context" }, [
      rule("context.a"),
      rule("context.b", { required_from: "structured", depends_on: ["context.a"] }),
    ]),
    ruleFile("conventions.yaml", { pillar: "conventions" }, [
      rule("conventions.a", { required_from: "optimized" }),
    ]),
    ruleFile("constraints.yaml", { pillar: "constraints" }, [
      rule("constraints.a", {
        required_from: "autonomous",
        evaluation: { on_missing: "unknown", unknown_reason: "Needs a human decision." },
        remediation: {
          classification: "human-required",
          summary: "Decide.",
          decision: "Which boundaries matter.",
        },
      }),
    ]),
    ruleFile("feedback.yaml", { pillar: "feedback" }, [
      rule("feedback.a", { applies_when: { any: ["project.language"] }, evidence: { any: ["command.test"] } }),
    ]),
    ruleFile("security.yaml", { dimension: "security" }, [
      rule("constraints.secrets", {
        dimension: "security",
        severity: "recommended",
        evidence: { none: ["security.tracked_secret_files"] },
      }),
    ]),
  ];
}

function sourceWith(rules: RuleFile[], mutate?: (source: Source) => void): Source {
  const source = structuredClone(loadSource());
  source.rules = rules as Source["rules"];
  mutate?.(source);
  return source;
}

const validate = (source: Source) => validateSource(source, { requireCoverage: true });

describe("Agent Ready Spec v1 sources", () => {
  it("the committed spec is valid", () => {
    expect(validateSource(loadSource(), { requireCoverage: true })).toEqual([]);
  });

  it("declares versioned metadata", () => {
    const { spec } = loadSource();
    expect(spec.data.schema_version).toBe("1");
    expect(spec.data.name).toBe("agent-ready");
    expect(spec.data.spec_version).toMatch(/^1\.\d+\.\d+/);
  });

  it("preserves the four pillars and treats security/performance as dimensions", () => {
    const { spec } = loadSource();
    expect(spec.data.pillars.map((p: { id: string }) => p.id)).toEqual([
      "context",
      "conventions",
      "constraints",
      "feedback",
    ]);
    expect(spec.data.dimensions.map((d: { id: string }) => d.id)).toEqual(["security", "performance"]);
  });

  it("preserves the five maturity levels in rank order", () => {
    const { maturity } = loadSource();
    expect(maturity.data.maturity.levels.map((l: { id: string; rank: number }) => [l.rank, l.id])).toEqual([
      [0, "unaware"],
      [1, "foundational"],
      [2, "structured"],
      [3, "optimized"],
      [4, "autonomous"],
    ]);
  });
});

describe("validation", () => {
  it("accepts a covering rule set", () => {
    expect(validate(sourceWith(coveringRules()))).toEqual([]);
  });

  it("rejects duplicate rule ids", () => {
    const files = coveringRules();
    files[0].data.rules.push(rule("context.b"));
    expect(validate(sourceWith(files))).toContain("duplicate rule id: context.b");
  });

  it("rejects invalid pillar names", () => {
    const files = coveringRules();
    files[0].data.rules[0].pillar = "vibes";
    expect(validate(sourceWith(files)).some((e) => e.includes("context.yaml: schema"))).toBe(true);
  });

  it("rejects an id that does not start with its pillar", () => {
    const files = coveringRules();
    files[2].data.rules[0].id = "conventions.zz";
    files[2].data.rules[0].pillar = "constraints";
    files[2].data.rules[0].dimension = undefined;
    const errors = validate(sourceWith(files));
    expect(errors).toContain("rule conventions.zz: id must start with its pillar 'constraints'");
  });

  it("rejects unknown maturity levels", () => {
    const files = coveringRules();
    files[0].data.rules[0].required_from = "legendary";
    expect(validate(sourceWith(files))).toContain(
      "rule context.a: required_from 'legendary' is not a maturity level",
    );
  });

  it("rejects rules gating the rank 0 level", () => {
    const files = coveringRules();
    files[0].data.rules[0].required_from = "unaware";
    expect(validate(sourceWith(files))).toContain("rule context.a: required_from cannot be the rank 0 level");
  });

  it("rejects non-contiguous maturity ranks", () => {
    const errors = validate(
      sourceWith(coveringRules(), (source) => {
        source.maturity.data.maturity.levels[2].rank = 7;
      }),
    );
    expect(errors).toContain("maturity.yaml: level structured has rank 7; expected 2");
  });

  it("rejects dependency cycles", () => {
    const files = coveringRules();
    files[0].data.rules[0].depends_on = ["context.b"];
    files[0].data.rules[0].required_from = "structured";
    expect(validate(sourceWith(files))).toContain("rule dependency cycle: context.a -> context.b -> context.a");
  });

  it("rejects dependencies on rules introduced at a higher level", () => {
    const files = coveringRules();
    files[0].data.rules[1].required_from = "foundational";
    files[0].data.rules[0].required_from = "structured";
    expect(validate(sourceWith(files))).toContain(
      "rule context.b: depends on context.a, which is only in scope from a higher level (structured)",
    );
  });

  it("rejects references to rules that do not exist", () => {
    const files = coveringRules();
    files[0].data.rules[1].depends_on = ["context.missing"];
    expect(validate(sourceWith(files))).toContain("rule context.b: depends on unknown rule context.missing");
  });

  it("rejects references to evidence that does not exist", () => {
    const files = coveringRules();
    files[3].data.rules[0].evidence = { any: ["command.test", { all: ["file.nope"] }] };
    expect(validate(sourceWith(files))).toContain("rule feedback.a: references unknown evidence file.nope");
  });

  it("requires an evidence expression on every rule", () => {
    const files = coveringRules();
    delete files[0].data.rules[0].evidence;
    expect(validate(sourceWith(files)).some((e) => e.includes("must have required property 'evidence'"))).toBe(true);
  });

  it("requires unknown_reason exactly when missing evidence is unknown", () => {
    const files = coveringRules();
    files[2].data.rules[0].evaluation = { on_missing: "unknown" };
    files[0].data.rules[0].evaluation = { on_missing: "fail", unknown_reason: "x" };
    const errors = validate(sourceWith(files));
    expect(errors.some((e) => e.startsWith("constraints.yaml: schema"))).toBe(true);
    expect(errors.some((e) => e.startsWith("context.yaml: schema"))).toBe(true);
  });

  it("requires a decision for human-required remediation", () => {
    const files = coveringRules();
    files[0].data.rules[0].remediation = { classification: "human-required", summary: "x" };
    expect(validate(sourceWith(files)).some((e) => e.includes("'decision'"))).toBe(true);
  });

  it("requires rules to be sorted by id within a file", () => {
    const files = coveringRules();
    files[0].data.rules.reverse();
    expect(validate(sourceWith(files))).toContain("context.yaml: rules must be sorted by id");
  });

  it("requires dimension rules to live in their dimension file", () => {
    const files = coveringRules();
    files[0].data.rules.push(rule("context.c", { dimension: "security" }));
    expect(validate(sourceWith(files))).toContain("context.yaml: rule context.c belongs in the security file");
  });

  it("rejects non-portable or invalid regular expressions", () => {
    const errors = validate(
      sourceWith(coveringRules(), (source) => {
        const item = source.evidence.data.evidence.find((e: { id: string }) => e.id === "ci.runs_tests");
        item.detection.patterns = ["(?<=x)test", "(?i)test", "(unclosed"];
      }),
    );
    expect(errors.filter((e) => e.startsWith("evidence ci.runs_tests:"))).toHaveLength(3);
  });

  it("rejects heading/content detections that point at non-path evidence", () => {
    const errors = validate(
      sourceWith(coveringRules(), (source) => {
        const item = source.evidence.data.evidence.find((e: { id: string }) => e.id === "ci.runs_tests");
        item.detection.in = ["command.test"];
      }),
    );
    expect(errors).toContain("evidence ci.runs_tests: 'in' must reference path evidence, got command.test");
  });

  it("rejects a spec version that does not match its directory", () => {
    const errors = validate(
      sourceWith(coveringRules(), (source) => {
        source.spec.data.spec_version = "2.0.0";
      }),
    );
    expect(errors).toContain("spec.yaml: spec_version 2.0.0 does not belong in directory v1/");
  });

  it("rejects changes to the closed status vocabulary", () => {
    const errors = validate(
      sourceWith(coveringRules(), (source) => {
        source.spec.data.statuses.push({ id: "maybe", description: "Hmm." });
      }),
    );
    expect(errors).toContain("spec.yaml: statuses must be exactly [pass, fail, unknown, not-applicable]");
  });

  it("rejects sources that are not course lessons in this repository", () => {
    const files = coveringRules();
    files[0].data.rules[0].sources = ["content/module-99/01-missing.mdx"];
    expect(validate(sourceWith(files))).toContain("source does not exist: content/module-99/01-missing.mdx");
  });

  it("enforces coverage of every pillar and every maturity level", () => {
    const files = coveringRules().filter((file) => file.name !== "conventions.yaml");
    const errors = validate(sourceWith(files));
    expect(errors).toContain("pillar conventions has no rules");
    expect(errors).toContain("maturity level optimized has no required rules");
  });
});

describe("bundle", () => {
  it("assembles deterministically with canonical key order", () => {
    const first = canonicalJson(assemble(sourceWith(coveringRules())));
    const shuffled = coveringRules().reverse();
    const second = canonicalJson(assemble(sourceWith(shuffled)));
    expect(second).toBe(first);
    expect(sha256(second)).toBe(sha256(first));
    expect(first.endsWith("\n")).toBe(true);
  });

  it("sorts rules and evidence by id and drops source-only keys", () => {
    const bundle = assemble(sourceWith(coveringRules()));
    const ruleIds = bundle.rules.map((r: { id: string }) => r.id);
    expect(ruleIds).toEqual([...ruleIds].sort());
    const evidenceIds = bundle.evidence.map((e: { id: string }) => e.id);
    expect(evidenceIds).toEqual([...evidenceIds].sort());
    expect(bundle).not.toHaveProperty("includes");
    expect(bundle.document_type).toBe("agent-ready.spec");
    expect(bundleFileName(bundle)).toBe(`agent-ready-spec-${bundle.spec_version}.json`);
  });

  it("collects evidence references from nested expressions", () => {
    expect(expressionRefs({ any: ["a.b", { all: ["c.d", { none: ["e.f"] }] }] })).toEqual(["a.b", "c.d", "e.f"]);
  });
});

describe("Agent Ready Spec v1 requirements", () => {
  const bundle = assemble(loadSource());
  const ruleById = new Map(bundle.rules.map((r: Rule) => [r.id, r]));

  it("matches the committed canonical bundle exactly", () => {
    const committed = readFileSync(path.join(DIST_DIR, bundleFileName(bundle)), "utf8");
    expect(committed).toBe(canonicalJson(bundle));
  });

  it("gates each maturity level with an explicit, reviewed set of required rules", () => {
    const matrix: Record<string, string[]> = {};
    for (const r of bundle.rules as Rule[]) {
      if (r.severity !== "required") continue;
      (matrix[r.required_from as string] ??= []).push(r.id);
    }
    expect(matrix).toEqual({
      foundational: [
        "context.readme",
        "context.readme.setup",
        "conventions.tooling",
        "feedback.build.available",
        "feedback.tests.available",
      ],
      structured: [
        "constraints.documented",
        "constraints.mcp.no_inline_secrets",
        "constraints.secrets.ignored",
        "constraints.secrets.untracked",
        "context.agent_instructions",
        "context.agent_instructions.commands",
        "context.architecture",
        "conventions.documented",
        "conventions.enforced",
        "feedback.tests.present",
        "feedback.typecheck",
      ],
      optimized: [
        "constraints.architecture_boundaries",
        "context.agent_instructions.hierarchical",
        "context.task_workflows",
      ],
      autonomous: [
        "context.contribution_workflow",
        "conventions.ci_enforced",
        "feedback.agent_effectiveness",
        "feedback.ci.security",
        "feedback.ci.tests",
      ],
    });
  });

  it("encodes the canonical examples from the roadmap", () => {
    expect(ruleById.get("feedback.tests.available")).toMatchObject({
      pillar: "feedback",
      required_from: "foundational",
      severity: "required",
      evidence: { any: ["command.test"] },
    });
    expect(ruleById.get("context.agent_instructions")).toMatchObject({
      pillar: "context",
      required_from: "structured",
      remediation: { classification: "automatable" },
    });
    expect(ruleById.get("constraints.architecture_boundaries")).toMatchObject({
      required_from: "optimized",
      evaluation: { on_missing: "unknown" },
      remediation: { classification: "human-required" },
    });
  });

  it("only treats missing evidence as unknown for human-required policy", () => {
    const unknownRules = (bundle.rules as Rule[]).filter(
      (r) => (r.evaluation as { on_missing: string }).on_missing === "unknown",
    );
    expect(unknownRules.map((r) => r.id)).toEqual([
      "constraints.agent_permissions",
      "constraints.architecture_boundaries",
      "feedback.agent_effectiveness",
    ]);
  });

  it("rejects an unknown evaluation policy on automatable remediation", () => {
    const files = coveringRules();
    files[2].data.rules[0].remediation = { classification: "assisted", summary: "x" };
    expect(validate(sourceWith(files))).toContain(
      "rule constraints.a: on_missing 'unknown' requires human-required remediation",
    );
  });

  it("references only evidence declared in the vocabulary", () => {
    const declared = new Set(bundle.evidence.map((e: { id: string }) => e.id));
    for (const r of bundle.rules as Rule[]) {
      for (const ref of [...expressionRefs(r.evidence), ...expressionRefs(r.applies_when)]) {
        expect(declared.has(ref), `${r.id} -> ${ref}`).toBe(true);
      }
    }
  });
});

describe("spec/README.md", () => {
  it("documents every required rule in the maturity table", () => {
    const readme = readFileSync(path.join(DIST_DIR, "..", "README.md"), "utf8");
    const bundle = assemble(loadSource());
    for (const r of bundle.rules as Rule[]) {
      if (r.severity === "required") expect(readme, r.id).toContain(`\`${r.id}\``);
    }
  });
});
