# 00 — Vision

A top-down pixel-art RPG in a world of swords and magic. Long-term the game
has 10 floors, each a themed open world (plains, forest, desert, emerald city,
broken mine town, perpetual night town, ..., ending at "City in the Sky" with
the final boss who linked the floors to subjugate them). Each floor has a
unique town, theme, and a dungeon with a themed boss that unlocks the gate to
the next floor. This project builds Floor 1 (plains/starter town) first.

## Core mechanics

- **Character creation at start:** body type, skin/hair color, hair style.
  Initial skill point allocation determines which weapons, magic, and skills
  the character can learn.
- **Permadeath.** One save slot. Death wipes the save. This is a feature.
- **Overworld:** top-down movement, "press E" prompt appears over
  interactables when in range. Enemies patrol visibly on the map.
- **Aggro indicators** above enemies:
  - green — won't aggro, player over-leveled
  - yellow — will aggro if close
  - red — dangerous, aggros at range
  Level disparity drives this.
- When combat triggers, the player + all nearby enemies within a "pull range"
  transition to a turn-based combat scene.
- **Combat is initiative-based.** Attribute-driven turn order. Agility boosts
  can cause a unit to get two turns in a row if their initiative lapped the
  others. Turn order recalculates each round.
- **Quests** give EXP + gold/items (potions, gear).
- **Equipment is visualized** on the player sprite — equipped gear changes how
  the character looks on the overworld and in combat.
- **NPCs** exist in towns with dialogue, shops, and quests. Example starting
  quest: goblins raiding a nearby farm are disrupting the market's food
  supply.
- **Narrative frame:** characters are "uploaded" into the world aware they're
  in a game-like environment.
