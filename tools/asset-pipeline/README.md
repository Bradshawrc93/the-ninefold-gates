# Asset Pipeline

Generates pixel-art assets via the [Retro Diffusion](https://retrodiffusion.ai/)
API and registers them in `manifest.json`.

## Usage

```bash
# generate a sprite
pnpm asset:new --name player_idle_down --prompt "young hero in brown tunic"

# estimate credit cost without generating
pnpm asset:cost --name goblin_scout --prompt "green goblin with rusty dagger"

# regenerate / overwrite
pnpm asset:new --name player_idle_down --prompt "..." --force

# other asset classes
pnpm asset:new --name grass_tile --type tilesets --width 32 --height 32 --prompt "grass terrain tile"
pnpm asset:new --name npc_blacksmith --type portraits --width 128 --height 128 --prompt "burly blacksmith portrait"
```

## Flags

| Flag        | Default            | Notes                                       |
| ----------- | ------------------ | ------------------------------------------- |
| `--name`    | — (required)       | snake_case asset name, used as filename     |
| `--prompt`  | — (required)       | positive prompt; style suffix added for you |
| `--type`    | `sprites`          | `sprites`, `tilesets`, `ui`, `portraits`    |
| `--style`   | `rd_fast__default` | RD model slug                               |
| `--width`   | `64`               | pixels                                      |
| `--height`  | `64`               | pixels                                      |
| `--seed`    | random             | set for reproducibility                     |
| `--force`   | false              | overwrite file + manifest entry             |
| `--dry-run` | false              | estimate cost only, no image                |

## Style lock

Every prompt is automatically suffixed with the project style keywords
and negative prompt defined in `docs/design/04-art-direction.md`. Update
that doc if you change the house style — the pipeline's defaults live
in constants at the top of `generate.mjs`.

## manifest.json (rule 3)

`manifest.json` is the source of truth for every generated asset. The
pipeline writes an entry with `prompt`, `seed`, `model`, `credit_cost`,
and `generated_at` so any asset can be reproduced. **Never drop PNGs
into `public/assets/` by hand** — they must flow through the pipeline.

Before generating a new asset, grep `manifest.json` for a similar name
or prompt; reuse beats regeneration.

## Secrets

`RETRO_DIFFUSION_API_KEY` is loaded from `.env` via Node's native
`--env-file` flag (Node 20+). `.env` is gitignored; do not commit it.

## Post-processing (Session 3+)

The pipeline currently writes the RD output as-is. Planned additions:

- transparent background enforcement (alpha key from corner pixel)
- optional palette quantization to a shared project palette
- spritesheet splitting (one generation → N frames)

Each step registers in the asset's `processing` array in the manifest.
