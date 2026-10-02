// Agent Ready Spec tooling: load YAML sources, validate them, and assemble the
// canonical JSON bundle that downstream assessors (for example Agentic Dev) consume.
//
// Plain ESM with no build step so scripts/spec.mjs and the vitest suite share it.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";

export const SPEC_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const REPO_ROOT = path.dirname(SPEC_ROOT);
export const DIST_DIR = path.join(SPEC_ROOT, "dist");

export const STATUSES = ["pass", "fail", "unknown", "not-applicable"];
export const SEVERITIES = ["required", "recommended", "advisory"];
export const CLASSIFICATIONS = ["automatable", "assisted", "human-required"];

const SOURCE_SCHEMAS = {
  spec: "specFile",
  maturity: "maturityFile",
  evidence: "evidenceFile",
  rules: "ruleFile",
};

// Constructs that do not behave identically across JavaScript and Python
// regular expression engines. Assessors in either language must agree.
const NON_PORTABLE_REGEX = [
  [/\(\?<[=!]/, "lookbehind"],
  [/\(\?<[A-Za-z]/, "named group"],
  [/\(\?P/, "named group"],
  [/\(\?[a-zA-Z]+[):]/, "inline flags"],
  [/\\[1-9]/, "backreference"],
  [/\\k</, "backreference"],
];

function parseYaml(file) {
  return YAML.parse(readFileSync(file, "utf8"), { merge: true, uniqueKeys: true });
}

/** Load the authored YAML sources of one spec major version directory. */
export function loadSource(versionDir = path.join(SPEC_ROOT, "v1")) {
  const spec = parseYaml(path.join(versionDir, "spec.yaml"));
  const includes = spec?.includes ?? {};
  const read = (name) => ({ name, data: parseYaml(path.join(versionDir, name)) });
  return {
    versionDir,
    major: path.basename(versionDir),
    schema: JSON.parse(readFileSync(path.join(versionDir, "schema.json"), "utf8")),
    spec: { name: "spec.yaml", data: spec },
    maturity: read(includes.maturity),
    evidence: read(includes.evidence),
    rules: (includes.rules ?? []).map(read),
  };
}

function stripExtensions(value) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith("x-")));
}

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Assemble the single bundle document from validated sources.
 * @returns {Record<string, any>}
 */
export function assemble(source) {
  const meta = stripExtensions(source.spec.data);
  delete meta.includes;
  return {
    ...meta,
    document_type: "agent-ready.spec",
    maturity: source.maturity.data.maturity,
    evidence: [...source.evidence.data.evidence].sort(byId),
    rules: source.rules.flatMap((file) => file.data.rules).sort(byId),
  };
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]),
    );
  }
  return value;
}

/** Canonical serialization: recursively sorted keys, 2-space indent, trailing newline. */
export function canonicalJson(value) {
  return `${JSON.stringify(sortKeys(value), null, 2)}\n`;
}

export function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function bundleFileName(bundle) {
  return `agent-ready-spec-${bundle.spec_version}.json`;
}

function makeAjv(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  ajv.addSchema(schema, "agent-ready");
  return ajv;
}

function schemaErrors(ajv, ref, data, label) {
  const validate = ajv.getSchema(`agent-ready#/$defs/${ref}`);
  if (validate(data)) return [];
  return validate.errors.map(
    (error) => `${label}: schema: ${error.instancePath || "/"} ${error.message}`,
  );
}

function duplicates(values) {
  const seen = new Set();
  const dup = new Set();
  for (const value of values) {
    if (seen.has(value)) dup.add(value);
    seen.add(value);
  }
  return [...dup].sort();
}

function isSorted(items) {
  return items.every((item, index) => index === 0 || byId(items[index - 1], item) < 0);
}

/** Evidence ids referenced anywhere inside an expression. */
export function expressionRefs(expression) {
  if (typeof expression === "string") return [expression];
  if (!expression || typeof expression !== "object") return [];
  return Object.values(expression).flatMap((operands) =>
    Array.isArray(operands) ? operands.flatMap(expressionRefs) : [],
  );
}

function checkRegex(pattern) {
  for (const [construct, label] of NON_PORTABLE_REGEX) {
    if (construct.test(pattern)) return `non-portable regex (${label})`;
  }
  try {
    new RegExp(pattern, "i");
  } catch (error) {
    return `invalid regex: ${error.message}`;
  }
  return null;
}

function findCycle(rules) {
  const graph = new Map(rules.map((rule) => [rule.id, rule.depends_on ?? []]));
  const state = new Map();
  const stack = [];
  const visit = (id) => {
    if (state.get(id) === "done") return null;
    if (state.get(id) === "active") return [...stack.slice(stack.indexOf(id)), id];
    state.set(id, "active");
    stack.push(id);
    for (const next of graph.get(id) ?? []) {
      if (!graph.has(next)) continue;
      const cycle = visit(next);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(id, "done");
    return null;
  };
  for (const id of [...graph.keys()].sort()) {
    const cycle = visit(id);
    if (cycle) return cycle;
  }
  return null;
}

/**
 * Validate sources structurally (JSON Schema) and semantically.
 * Returns a sorted list of human-readable error strings; empty means valid.
 */
export function validateSource(source, { repoRoot = REPO_ROOT, requireCoverage = true } = {}) {
  const errors = [];
  const ajv = makeAjv(source.schema);

  errors.push(...schemaErrors(ajv, SOURCE_SCHEMAS.spec, source.spec.data, source.spec.name));
  errors.push(...schemaErrors(ajv, SOURCE_SCHEMAS.maturity, source.maturity.data, source.maturity.name));
  errors.push(...schemaErrors(ajv, SOURCE_SCHEMAS.evidence, source.evidence.data, source.evidence.name));
  for (const file of source.rules) {
    errors.push(...schemaErrors(ajv, SOURCE_SCHEMAS.rules, file.data, file.name));
  }
  // Semantic checks assume structurally valid input.
  if (errors.length) return errors.sort();

  const spec = source.spec.data;
  const bundle = assemble(source);
  errors.push(...schemaErrors(ajv, "bundle", bundle, "bundle"));

  // Versioning.
  const major = spec.spec_version.split(".")[0];
  if (`v${major}` !== source.major) {
    errors.push(`spec.yaml: spec_version ${spec.spec_version} does not belong in directory ${source.major}/`);
  }

  // Closed vocabularies that assessors rely on.
  const exact = (label, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push(`spec.yaml: ${label} must be exactly [${expected.join(", ")}]`);
    }
  };
  exact("statuses", spec.statuses.map((s) => s.id), STATUSES);
  exact("severities", spec.severities.map((s) => s.id), SEVERITIES);
  exact(
    "remediation_classifications",
    spec.remediation_classifications.map((s) => s.id),
    CLASSIFICATIONS,
  );

  for (const [label, items] of [
    ["pillar", spec.pillars],
    ["dimension", spec.dimensions],
    ["evidence category", spec.evidence_categories],
    ["maturity level", bundle.maturity.levels],
    ["evidence", bundle.evidence],
    ["rule", bundle.rules],
  ]) {
    for (const id of duplicates(items.map((item) => item.id))) {
      errors.push(`duplicate ${label} id: ${id}`);
    }
  }

  // Maturity: contiguous ranks starting at 0, listed in rank order.
  const levels = bundle.maturity.levels;
  levels.forEach((level, index) => {
    if (level.rank !== index) {
      errors.push(`${source.maturity.name}: level ${level.id} has rank ${level.rank}; expected ${index}`);
    }
  });
  const rank = new Map(levels.map((level) => [level.id, level.rank]));

  // Evidence vocabulary.
  const categories = new Set(spec.evidence_categories.map((c) => c.id));
  const evidence = new Map(bundle.evidence.map((item) => [item.id, item]));
  if (!isSorted(source.evidence.data.evidence)) {
    errors.push(`${source.evidence.name}: evidence must be sorted by id`);
  }
  for (const item of bundle.evidence) {
    const prefix = item.id.split(".")[0];
    if (prefix !== item.category) {
      errors.push(`evidence ${item.id}: id prefix must equal category '${item.category}'`);
    }
    if (!categories.has(item.category)) {
      errors.push(`evidence ${item.id}: unknown category '${item.category}'`);
    }
    const detection = item.detection;
    for (const ref of detection.in ?? []) {
      const target = evidence.get(ref);
      if (!target) errors.push(`evidence ${item.id}: 'in' references unknown evidence ${ref}`);
      else if (target.detection.kind !== "path") {
        errors.push(`evidence ${item.id}: 'in' must reference path evidence, got ${ref}`);
      }
    }
    for (const pattern of detection.patterns ?? []) {
      const problem = checkRegex(pattern);
      if (problem) errors.push(`evidence ${item.id}: ${problem}: ${pattern}`);
    }
  }

  // Rules.
  const rules = new Map(bundle.rules.map((rule) => [rule.id, rule]));
  const pillars = new Set(spec.pillars.map((p) => p.id));
  const dimensions = new Set(spec.dimensions.map((d) => d.id));
  for (const file of source.rules) {
    const scope = file.data.scope;
    if (!isSorted(file.data.rules)) errors.push(`${file.name}: rules must be sorted by id`);
    if (scope.pillar && !pillars.has(scope.pillar)) {
      errors.push(`${file.name}: scope pillar '${scope.pillar}' is not declared`);
    }
    if (scope.dimension && !dimensions.has(scope.dimension)) {
      errors.push(`${file.name}: scope dimension '${scope.dimension}' is not declared`);
    }
    for (const rule of file.data.rules) {
      if (scope.pillar && (rule.pillar !== scope.pillar || rule.dimension)) {
        errors.push(
          `${file.name}: rule ${rule.id} belongs in ${rule.dimension ? `the ${rule.dimension}` : `the ${rule.pillar}`} file`,
        );
      }
      if (scope.dimension && rule.dimension !== scope.dimension) {
        errors.push(`${file.name}: rule ${rule.id} must declare dimension '${scope.dimension}'`);
      }
    }
  }
  for (const rule of bundle.rules) {
    if (rule.id.split(".")[0] !== rule.pillar) {
      errors.push(`rule ${rule.id}: id must start with its pillar '${rule.pillar}'`);
    }
    if (!rank.has(rule.required_from)) {
      errors.push(`rule ${rule.id}: required_from '${rule.required_from}' is not a maturity level`);
    } else if (rank.get(rule.required_from) === 0) {
      errors.push(`rule ${rule.id}: required_from cannot be the rank 0 level`);
    }
    for (const ref of [...expressionRefs(rule.evidence), ...expressionRefs(rule.applies_when)]) {
      if (!evidence.has(ref)) errors.push(`rule ${rule.id}: references unknown evidence ${ref}`);
    }
    for (const dep of rule.depends_on ?? []) {
      if (dep === rule.id) {
        errors.push(`rule ${rule.id}: depends on itself`);
        continue;
      }
      const target = rules.get(dep);
      if (!target) {
        errors.push(`rule ${rule.id}: depends on unknown rule ${dep}`);
      } else if ((rank.get(target.required_from) ?? 0) > (rank.get(rule.required_from) ?? 0)) {
        errors.push(
          `rule ${rule.id}: depends on ${dep}, which is only in scope from a higher level (${target.required_from})`,
        );
      }
    }
  }
  const cycle = findCycle(bundle.rules);
  if (cycle) errors.push(`rule dependency cycle: ${cycle.join(" -> ")}`);

  if (requireCoverage) {
    for (const pillar of spec.pillars) {
      if (!bundle.rules.some((rule) => rule.pillar === pillar.id)) {
        errors.push(`pillar ${pillar.id} has no rules`);
      }
    }
    for (const level of levels.filter((l) => l.rank > 0)) {
      const gated = bundle.rules.some(
        (rule) => rule.severity === "required" && rule.required_from === level.id,
      );
      if (!gated) errors.push(`maturity level ${level.id} has no required rules`);
    }
  }

  // Every course reference must point at an existing lesson.
  const sourceRefs = [
    ...spec.pillars.flatMap((p) => p.sources),
    ...spec.dimensions.flatMap((d) => d.sources),
    ...levels.flatMap((l) => l.sources),
    ...bundle.rules.flatMap((r) => r.sources),
  ];
  for (const ref of [...new Set(sourceRefs)].sort()) {
    if (!existsSync(path.join(repoRoot, ref))) errors.push(`source does not exist: ${ref}`);
  }

  return [...new Set(errors)].sort();
}
