#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const ROOT = path.resolve(import.meta.dirname, "..");
const API_DIR = path.join(ROOT, "src", "app", "api");
const BACKUP_DIR = path.join(ROOT, `.api-backup-${randomBytes(4).toString("hex")}`);
const OUT_DIR = path.join(ROOT, "out");

let movedApi = false;

try {
  for (const dir of [path.join(ROOT, ".next"), OUT_DIR]) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  }

  if (fs.existsSync(API_DIR)) {
    fs.renameSync(API_DIR, BACKUP_DIR);
    movedApi = true;
  }

  execSync("npx next build", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: "true" },
  });

  fs.writeFileSync(path.join(OUT_DIR, ".nojekyll"), "");
} finally {
  if (movedApi && fs.existsSync(BACKUP_DIR)) {
    fs.renameSync(BACKUP_DIR, API_DIR);
  }
}
