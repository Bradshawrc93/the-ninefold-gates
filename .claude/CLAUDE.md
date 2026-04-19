# RPG Game — Project Guide

A top-down pixel-art turn-based RPG in a world of swords and magic, built browser-first.

Full brief: see [docs/design/00-vision.md](../docs/design/00-vision.md).

## Stack

- Runtime: Node 20, pnpm
- Bundler: Vite
- Language: TypeScript, strict mode, no `any` without justification
- Engine: Phaser 3.80+
- Meta-state outside scenes: Zustand
- Persistence: IndexedDB via idb-keyval (single save slot)
- Art generation: Retro Diffusion API (pipeline comes in Session 3)
- Testing: Vitest for pure logic
- Deploy target: Vercel

## Architectural Rules (non-negotiable)

1. `src/systems/` is pure TypeScript. Zero Phaser imports. Combat math,
   character progression, inventory, quest logic, RNG — all engine-agnostic.
   Scenes consume systems, never the reverse.
2. All game content (items, enemies, quests, dialogue, NPCs, floors) lives
   as JSON in `src/data/`. Zero hardcoded content in scenes.
3. Every generated asset is registered in `tools/asset-pipeline/manifest.json`
   with prompt, seed, provider, processing steps. No orphan PNGs in
   `public/assets/`.
4. RNG is seeded and deterministic. Saves include RNG state. Combat must be
   reproducible given the same seed. This matters for testing and for
   permadeath fairness.
5. One save slot. Permadeath on death deletes the save. No workarounds.

## Working style

- Check `docs/design/` before building anything. That folder is the source of
  truth for game design.
- Ask before guessing on vague specs. Don't invent mechanics.
- Check `tools/asset-pipeline/manifest.json` before generating assets — if a
  matching asset exists, reuse it.
- Favor extending existing systems over creating new files. Small, composable
  modules in `src/systems/` beat sprawling scene code.

## Current phase

**Vertical slice:** character creation → spawn in town → walk to one NPC →
accept one quest → exit town → one combat encounter → return → turn in quest
→ save/load. Nothing else until this works end-to-end.

## What's built

Session 1 — Infrastructure (this session):

- pnpm + Vite + TypeScript (strict) + Phaser 3
- ESLint (TS strict + prettier-compat) and Prettier config
- Vitest with seeded RNG module and passing tests in `src/systems/rng/`
- `BootScene` that clears to a solid color and displays "Floor 0: Boot"
- Directory scaffold: `src/{scenes,systems,entities,data,ui}`,
  `public/assets/{sprites,tilesets,ui,audio}`, `tools/asset-pipeline/`,
  `docs/{design,decisions}/`
- Design doc stubs: 00-vision through 05-content-floor-01
- Git initialized with initial commit

Session 2 — Asset pipeline:

- Retro Diffusion API wired end-to-end: `pnpm asset:new --name X --prompt "..."`
  generates a PNG, writes to `public/assets/<type>/`, registers in
  `tools/asset-pipeline/manifest.json`. `pnpm asset:cost` for dry-run.
- Style locked to Chrono Trigger (SNES, 1995) — Toriyama character design,
  ¾ overhead camera. Full details in `docs/design/04-art-direction.md`.
- Default resolutions locked: 64×64 characters, 32×32 tiles, 128×128
  portraits/bosses.
- Reference sprite `player_idle_down.png` in manifest — use it as the
  on-model benchmark for future character generations.

## Up next

Vertical-slice sessions, in technical-risk order (not narrative order):
1. combat math core (pure TS) → 2. combat scene → 3. overworld movement
→ 4. NPC + dialogue → 5. quest + encounter trigger → 6. save/load/permadeath
→ 7. character creation.
