# 01 — Combat System

Turn-based, initiative-driven combat triggered when the player and nearby
enemies within pull range transition from the overworld into a combat scene.
This doc defines attributes, turn order, damage, resource pools, and regen.

## Attributes

Four primary attributes. Every character has all four; builds are defined by
how points are distributed, not by class.

| Attribute | Governs |
|-----------|---------|
| **STR** — Strength | Heavy weapon damage, stamina pool, carry capacity, STR-gated armor/skills |
| **AGI** — Agility   | Initiative (ATB fill rate), crit chance, dodge/evasion, light weapon damage |
| **INT** — Intellect | Magic damage, magic defense, MP pool, Arcane tree unlocks |
| **VIT** — Vitality  | HP pool, physical defense, stamina pool, status effect resistance |

**No LUCK stat.** Crit chance is folded into AGI.

**Hybrid weapon scaling.** Weapons declare one or two scaling attributes with
per-attribute coefficients. A pure greatsword: `STR × 1.5`. A magic sword:
`STR × 0.8 + INT × 0.8`. Hybrid weapons reward dual-stat investment.

## Initiative (ATB)

Turn order is driven by an Action Time Battle gauge. Every unit fills their
gauge each tick; first to 100 acts. This produces natural lapping — a fast
unit can act twice before a slow unit acts once.

```
ATB_fill_rate = 50 + AGI + (level × 2) − armor_penalty

Unit acts when ATB ≥ 100
After acting: ATB -= 100 (carryover preserved)
```

- **Base 50** is the floor — no character ever feels paralyzed.
- **+ AGI** is the dominant early-game lever.
- **+ (level × 2)** quiet gift to everyone. By level 20, every build has
  meaningfully faster turns regardless of AGI investment. This is the
  mechanism that lets a heavy-armor 2-hander feel fast at end-game.
- **Armor penalty** is STR-gated, not permanent. Meet the armor's STR
  requirement → penalty is 0. Miss it → -20 ATB fill. Heavy-armor builds
  that invest in STR pay no penalty.

**Armor STR requirements (tentative):**
| Tier | STR req |
|------|---------|
| Light  | 0  |
| Medium | 8  |
| Heavy  | 14 |
| Plate  | 20 |

**Buffs/debuffs that modify AGI immediately affect the turn queue.** The UI
should show the next ~5 upcoming turns and update live as modifiers apply.

## Damage formula

```
base      = weapon_base + Σ(scaling_stat × scaling_coefficient)
reduced   = base × (1 − defense / (defense + 100))
final     = reduced × crit_mult × element_mult × buff_mult
```

- **Physical damage** uses the defender's physical defense (from VIT + armor).
- **Magical damage** uses the defender's magical defense (from INT + gear).
- `defense / (defense + 100)` provides diminishing returns — 100 defense halves
  damage, 200 defense reduces by 2/3, etc. Armor never trivializes damage.
- `element_mult`: 2.0× on weakness, 0.5× on resist, 1.0× neutral.
- `buff_mult` stacks multiplicatively from active buffs/debuffs.

## Crits

```
crit_chance = 3% + (AGI × 0.4%)    // soft cap ~15% at AGI 30
crit_mult   = 1.5                  // tune to 2.0 if crits feel weak
```

Additionally, certain skills (e.g., Backstab, Execute under thresholds) are
**guaranteed crits** regardless of roll. These bypass the AGI-scaled chance.

## Resource pools

All three pools are **computed values** — base from attributes + gear modifiers
+ temporary buff modifiers. Everything must be buff/debuff-addressable.

```
Max HP      = 25 + (VIT × 5) + (level × 5)
Max MP      = 10 + (INT × 3) + (level × 3)
Max Stamina = 20 + (STR × 2) + (VIT × 2) + (level × 3)
```

- **HP** — when it hits 0, unit dies. For the player, this triggers permadeath.
- **MP** — spent on Arcane spells (INT-scaling actives).
- **Stamina** — spent on physical skill actives (STR/AGI-scaling actives).

## Regen and healing economy

**In combat:** no passive regen. Resources are spent, recovered only via
skills (e.g., "Second Wind" restores stamina) or items (potions).

**Out of combat:** three parallel healing paths — all builds have a viable
route, none is dominant.

1. **Passive trickle** — ~1% of each max pool per 5s while not in combat.
   Slow enough that "just wait" is a real time cost.
2. **Rest points** — inns (paid, full refill), campfires (free, full refill,
   limited uses per run, may trigger encounters in dungeons).
3. **Consumables + crafting** — potions (bought), First Aid crafted items
   (recipes gated by the First Aid non-combat skill tree, require gathered
   materials like herbs and bandages).
4. **Magical healing** — Arcane tree includes healing spells and buffs in
   its mid-to-late nodes. Mages become self-sufficient around level 12–15.

This produces a deliberate trade: mages spend MP to restore HP; warriors
spend materials/time to restore HP via First Aid or potions.

## Status effects (outline — details later)

Every status effect has a duration, a magnitude, and a resistance check
against VIT (physical) or INT (magical). Initial set for Floor 1:
- **Bleed** — physical DoT
- **Burn** — magical DoT, fire
- **Chill** — slows ATB fill rate
- **Stun** — skip next turn
- **Weaken** — reduces damage dealt
- **Shield** — flat damage absorption

## Determinism

Per the architectural rules, combat RNG is seeded and reproducible. Every
roll (crit, hit, damage variance, status application) draws from the seeded
RNG in `src/systems/rng/`. Saves include RNG state. Permadeath fairness
depends on this.
