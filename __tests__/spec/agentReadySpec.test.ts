// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
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
    expect(validateSource(loadSource(), { requireCoverage: false })).toEqual([]);
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
