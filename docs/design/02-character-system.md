# 02 — Character System

Covers character creation, leveling, stat and skill growth, and the skill
tree shape. Combat-specific formulas live in [01-combat-system.md](01-combat-system.md).

## Character creation

Players create exactly one character per save. Permadeath means each creation
is a deliberate commitment.

### Cosmetic options (no mechanical effect)

All appearance choices are purely cosmetic — no stat penalties or bonuses
attached to body type, skin tone, or hair. Mechanical identity comes from
stat allocation and the skill tree, not appearance. This avoids "optimal
race" min-maxing punishing aesthetic choice.

| Option     | Count | Values |
|------------|-------|--------|
| Body type  | 3     | Slim, Average, Heavy (silhouette variants) |
| Skin tone  | 6     | Range from pale to deep |
| Hair style | 6     | Short, long, ponytail, braid, shaved, messy |
| Hair color | 8     | Black, brown, blonde, red, white, blue, green, purple |

These translate to equipped-gear sprite layers in the art pipeline.
Every combination must be representable at the sprite-asset level.

### Starting stats + initial allocation

Every character starts at **Level 1** with a baseline of:

```
STR 5, AGI 5, INT 5, VIT 5
```

At creation, the player allocates:
- **10 bonus stat points** across the four attributes (commits the starting
  identity — e.g., a STR 13 warrior, a balanced STR 10 / INT 10 spellblade,
  etc.)
- **2 bonus skill points** spent in any skill tree for which they qualify

## Leveling

### XP curve

```
XP_to_next_level = 100 × level^1.5
```

Level 1→2 = 100 XP. 10→11 ≈ 3,162 XP. Keeps early pacing fast, late pacing
meaty.

### Per-level grants

Each level-up grants:
- **+1 to every attribute** automatically (prevents bricking; creates the
  "tank feels fast late game" pacing — see initiative formula)
- **+3 stat points** to allocate freely
- **+1 skill point** to spend in any tree the character qualifies for

Stat points and skill points are **separate pools**. Stat points shape what
your body can do; skill points shape what you know how to do.

## Skill trees

Five separate trees at launch — four combat (stat-gated), one non-combat
(ungated).

| Tree          | Gate         | Focus |
|---------------|--------------|-------|
| Heavy Weapons | STR          | Greatswords, axes, maces, shield-and-board |
| Light Weapons | AGI          | Daggers, rapiers, bows, finesse |
| Arcane        | INT          | Fire/ice/lightning spells; mid-late healing & buffs |
| Fortitude     | VIT          | Passive defenses, HP boosts, status resists |
| First Aid     | none         | Crafting heals, triage, gathered-material recipes |

### Gating

Each node declares a stat minimum to unlock (e.g., "STR 12") and a
prerequisite node. **Both conditions must be met.** A pure-STR character
fully explores Heavy Weapons but can only dip into Arcane's early nodes.
Multiclassing is possible but expensive — stat points are scarce.

### Node composition (per tree)

Roughly **15–20 nodes per tree**, distributed as:
- **~40% active abilities** — new moves usable in combat, cost stamina or MP
- **~40% passive bonuses** — always-on modifiers (damage %, resistances, etc.)
- **~20% upgrade nodes** — modify a previously-unlocked active

### Healing design note

Arcane's late nodes include healing spells and buffs, so mages become
self-sufficient around level 12–15. Before that, and for all non-INT builds
permanently, First Aid is the primary non-potion healing path. This makes
First Aid meaningfully valuable to every build, not a niche choice.

### Respec

**Permadeath-pure default:** no free respec.

**Safety valve:** a rare "Scroll of Reflection" item refunds all spent
skill points. Drops rarely from Floor bosses; one hidden NPC per floor
sells it at inflated cost. Stat points are not refundable — those are
permanent commitments.

## Non-combat skills (forward-looking)

First Aid is the first non-combat tree. Design leaves room for future
non-combat trees (Cooking, Lockpicking, Foraging) per-floor as the game
expands beyond Floor 1. These are not required for the vertical slice.

## Derived stats — design contract

Everything is a **computed value** = base (from attributes) + gear
modifiers + temporary buff/debuff modifiers. No system should store a
final derived stat as its source of truth. Buffs, items, and spells must
all be able to modify any derived stat.

Derived stats include, at minimum: Max HP, Max MP, Max Stamina, ATB fill
rate, physical defense, magical defense, crit chance, crit multiplier,
dodge chance, status resist values, and all damage multipliers.

The in-code stat system in `src/systems/` must expose a single
`computeStats(character)` path that produces the derived snapshot each
frame/turn. Scenes read from that snapshot, never the raw attributes.
