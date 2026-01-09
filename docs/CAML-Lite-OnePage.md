# CAML Lite (One Page)

CAML Lite is a minimal JSON structure for sharing **adventures** across tools (VTTs, generators, editors, test suites).
It is meant to be *easy to emit* and *easy to validate*.

## Required top-level fields

- `id` (string): globally unique module ID
- `type` (string): must be `"AdventureModule"`
- `name` (string)
- `locations` (array of Location)
- `npcs` (array of NPC)
- `encounters` (array of Encounter)

Optional: `quests`, `items`, `factions`, `handouts`, `ruleset`, `minLevel`, `maxLevel`, etc.

## Core object types

### Location
- `id` (string)
- `type`: `"Location"`
- `name` (string)
- optional `connections[]` objects with `target` (Location id)

### NPC
- `id` (string)
- `type`: `"NPC"`
- `name` (string)
- optional `startsAt` (Location id)

### Encounter
- `id` (string)
- `type`: `"Encounter"`
- required `occursAt` (Location id)
- optional `encounterType` (combat/social/exploration/etc.)
- optional `gates`, `outcomes` (tool-defined)

## Tooling guidance

- Use stable IDs; avoid duplicates.
- Prefer references by ID (not by name).
- Treat CAML as an interchange + validation layer. Keep using the tools you already like for authoring and runtime.

Schema: `schema/caml-lite.schema.json`
