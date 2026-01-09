// CAML-Lint semantic checks (warnings, not schema errors).
// These are intentionally lightweight and focused on practical developer value.

function collectIds(arr = []) {
  return arr.map(o => o?.id).filter(Boolean);
}

export function runSemanticChecks(caml) {
  const warnings = [];

  // 1) Duplicate IDs across core arrays
  const buckets = [
    ["Location", caml.locations],
    ["NPC", caml.npcs],
    ["Encounter", caml.encounters],
    ["Quest", caml.quests],
    ["Item", caml.items],
  ];

  const seen = new Map(); // id -> firstBucket
  for (const [label, arr] of buckets) {
    for (const id of collectIds(arr)) {
      if (seen.has(id)) {
        warnings.push(`Duplicate ID detected: '${id}' appears in ${seen.get(id)} and ${label}`);
      } else {
        seen.set(id, label);
      }
    }
  }

  // 2) Dangling references (startsAt/occursAt/startingLocation/connections)
  const locIds = new Set(collectIds(caml.locations));
  const npcIds = new Set(collectIds(caml.npcs));

  if (caml.startingLocation && !locIds.has(caml.startingLocation)) {
    warnings.push(`startingLocation references missing Location: '${caml.startingLocation}'`);
  }

  (caml.npcs || []).forEach(n => {
    if (n.startsAt && !locIds.has(n.startsAt)) {
      warnings.push(`NPC '${n.id}' startsAt missing Location: '${n.startsAt}'`);
    }
  });

  (caml.encounters || []).forEach(e => {
    if (e.occursAt && !locIds.has(e.occursAt)) {
      warnings.push(`Encounter '${e.id}' occursAt missing Location: '${e.occursAt}'`);
    }
  });

  (caml.locations || []).forEach(l => {
    (l.connections || []).forEach(c => {
      if (c?.target && !locIds.has(c.target)) {
        warnings.push(`Location '${l.id}' has connection to missing Location: '${c.target}'`);
      }
    });
  });

  // 3) Suspicious "PC Party" modeled as NPC (common in generators, but usually a smell)
  (caml.npcs || []).forEach(n => {
    const nm = (n.name || "").toLowerCase();
    if (nm.includes("pc party") || n.id === "npc.pc_party") {
      warnings.push(`'${n.id}' looks like the player party modeled as an NPC. Consider a dedicated Party/Actor type in your pipeline.`);
    }
  });

  // 4) Name/type mismatch heuristics
  (caml.encounters || []).forEach(e => {
    const name = (e.name || "").toLowerCase();
    const t = (e.encounterType || "").toLowerCase();
    if (name.includes("negotiation") && t === "combat") {
      warnings.push(`Encounter '${e.id}' suggests negotiation but encounterType is 'combat'`);
    }
    if (name.includes("exploration") && t === "combat") {
      warnings.push(`Encounter '${e.id}' suggests exploration but encounterType is 'combat'`);
    }
  });

  // 5) All encounters in same location (often a generator bug)
  const occurs = (caml.encounters || []).map(e => e.occursAt).filter(Boolean);
  const uniqueOccurs = new Set(occurs);
  if (occurs.length >= 3 && uniqueOccurs.size === 1) {
    warnings.push(`All encounters occur at the same location ('${[...uniqueOccurs][0]}'). If unintended, check encounter placement.`);
  }

  // 6) Linear-only location chain (informational)
  const outDegree = new Map();
  (caml.locations || []).forEach(l => outDegree.set(l.id, (l.connections || []).length));
  const branching = [...outDegree.values()].some(d => d >= 2);
  if ((caml.locations || []).length >= 5 && !branching) {
    warnings.push(`Location graph appears non-branching (a single path). This can be fine, but may indicate missing alternate routes/choices.`);
  }

  return warnings;
}
