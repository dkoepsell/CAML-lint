#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";
import chalk from "chalk";
import { validateSchema } from "../src/validateSchema.js";
import { runSemanticChecks } from "../src/semanticChecks.js";

function usage() {
  console.log(`caml-lint v0.1.0

Usage:
  caml-lint <file.caml.json> [--json]

Examples:
  caml-lint examples/the_tempests_wrath.caml.json
  caml-lint examples/shadows_of_the_silent_court.caml.json
`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
  usage();
  process.exit(args.length === 0 ? 1 : 0);
}

const jsonOut = args.includes("--json");
const file = args.find(a => !a.startsWith("-"));
if (!file) {
  usage();
  process.exit(1);
}

let caml;
try {
  const raw = fs.readFileSync(file, "utf-8");
  caml = JSON.parse(raw);
} catch (e) {
  const msg = `Failed to read/parse JSON: ${e.message}`;
  if (jsonOut) {
    console.log(JSON.stringify({ ok: false, errors: [msg], warnings: [] }, null, 2));
  } else {
    console.error(chalk.red(msg));
  }
  process.exit(2);
}

const errors = validateSchema(caml);
const warnings = runSemanticChecks(caml);

if (jsonOut) {
  console.log(JSON.stringify({ ok: errors.length === 0, errors, warnings }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

if (errors.length) {
  console.log(chalk.red("Schema errors:"));
  errors.forEach(e => console.log("  -", e));
} else {
  console.log(chalk.green("✔ Schema valid"));
}

if (warnings.length) {
  console.log(chalk.yellow("\nWarnings:"));
  warnings.forEach(w => console.log(chalk.yellow("  ⚠ " + w)));
} else {
  console.log(chalk.green("\n✔ No warnings"));
}

process.exit(errors.length ? 1 : 0);
