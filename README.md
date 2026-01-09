[![npm version](https://img.shields.io/npm/v/caml-lint.svg)](https://www.npmjs.com/package/caml-lint)
[![npm downloads](https://img.shields.io/npm/dm/caml-lint.svg)](https://www.npmjs.com/package/caml-lint)
## Why this exists

CAML-Lint helps game and narrative tool developers catch structural bugs
in adventure and quest data **without changing how they write or run games**.

It is designed to sit alongside Ink, Yarn, Twine, Unity, VTTs, and custom engines.
# CAML-Lint

Validate and **explain** CAML adventure files.

CAML-Lint is a tiny, developer-friendly linter for **CAML Lite** (CAML adventure JSON). It is designed to help tool builders and game designers catch structural issues early (duplicate IDs, broken references, suspicious encounter typing, unreachable content patterns) **without requiring any change to your existing toolchain**.

- Keep using Ink/Yarn/Twine for writing
- Keep using Unity/Unreal/VTTs for runtime
- Use CAML-Lint as a lightweight validation + QA layer

## Install

```bash
npm install -g caml-lint
```

## Use

```bash
caml-lint path/to/adventure.caml.json
```

Machine-readable output:

```bash
caml-lint path/to/adventure.caml.json --json
```

## What it catches (v0.1)

**Schema errors (hard failures):**
- Missing required top-level keys
- Wrong `type` values for core objects

**Warnings (practical QA):**
- Duplicate IDs across Locations/NPCs/Encounters/Quests/Items
- Dangling references (`startingLocation`, `startsAt`, `occursAt`, location `connections.target`)
- Name/type mismatches (e.g., “negotiation” encounter typed as combat)
- “All encounters occur at the same location” (common generator bug)
- “PC Party” modeled as an NPC (common modeling smell)

These checks are intentionally lightweight, so CAML-Lint can be adopted with near-zero overhead.

## Examples

This repo includes working examples you can lint immediately:

```bash
caml-lint examples/the_tempests_wrath.caml.json
caml-lint examples/shadows_of_the_silent_court.caml.json
```

## CI usage (GitHub Actions)

Add this to your workflow (example included in `.github/workflows/lint.yml`):

```yaml
- name: Install caml-lint
  run: npm i -g caml-lint
- name: Lint CAML
  run: caml-lint examples/the_tempests_wrath.caml.json
```

## CAML Lite (one-page schema)

The minimal schema lives at:

- `schema/caml-lite.schema.json`

It is intentionally permissive and practical. It is **not** a complete CAML 2.0 spec.

## Development

```bash
npm install
npm test
```

## Roadmap (short)

- Trace validation (`caml-trace.jsonl` ↔ module refs)
- More semantic warnings (unreachable content, inconsistent gates)
- Optional “fix suggestions” output (`--fix-suggest`)

## License

MIT
