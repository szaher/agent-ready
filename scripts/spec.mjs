// Agent Ready Spec gate.
//
//   node scripts/spec.mjs check   validate sources; verify spec/dist is up to date
//   node scripts/spec.mjs build   validate sources; regenerate spec/dist bundle
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  DIST_DIR,
  assemble,
  bundleFileName,
  canonicalJson,
  loadSource,
  sha256,
  validateSource,
} from "../spec/tools/agentReadySpec.mjs";

const OPTIONS = {
  // Coverage (every pillar has rules, every level is gated) is enforced once
  // the initial requirements land; the model-only state has no rules yet.
  requireCoverage: false,
  requireBundle: false,
};

const mode = process.argv[2];
if (mode !== "check" && mode !== "build") {
  console.error("usage: node scripts/spec.mjs <check|build>");
  process.exit(2);
}

const source = loadSource();
const errors = validateSource(source, { requireCoverage: OPTIONS.requireCoverage });
if (errors.length) {
  console.error(`Agent Ready spec is invalid (${errors.length} error(s)):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const bundle = assemble(source);
const name = bundleFileName(bundle);
const text = canonicalJson(bundle);
const existing = (() => {
  try {
    return readdirSync(DIST_DIR).filter((file) => file.endsWith(".json")).sort();
  } catch {
    return [];
  }
})();

if (mode === "build") {
  mkdirSync(DIST_DIR, { recursive: true });
  for (const file of existing) {
    if (file !== name) rmSync(path.join(DIST_DIR, file));
  }
  writeFileSync(path.join(DIST_DIR, name), text);
  console.log(`wrote spec/dist/${name} sha256=${sha256(text)}`);
  process.exit(0);
}

if (OPTIONS.requireBundle || existing.length) {
  const stale = [];
  if (existing.length !== 1 || existing[0] !== name) {
    stale.push(`expected exactly spec/dist/${name}, found [${existing.join(", ")}]`);
  } else if (readFileSync(path.join(DIST_DIR, name), "utf8") !== text) {
    stale.push(`spec/dist/${name} does not match the sources`);
  }
  if (stale.length) {
    console.error(`${stale.join("\n")}\nRun: pnpm spec:build`);
    process.exit(1);
  }
}

console.log(
  `Agent Ready spec ${bundle.spec_version} is valid: ${bundle.rules.length} rule(s), ` +
    `${bundle.evidence.length} evidence type(s), ${bundle.maturity.levels.length} levels.`,
);
