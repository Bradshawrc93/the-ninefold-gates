# 04 — Art Direction

Source of truth for style, resolution, and palette decisions. The asset
pipeline (`tools/asset-pipeline/generate.mjs`) enforces these defaults.

## Style anchor: Chrono Trigger (SNES, 1995)

Our north star. Toriyama character design (round expressive faces,
spiky/flowing hair, confident silhouettes), ¾ overhead camera, warm
saturated palette, soft dark outlines (never pure black), clean
anti-aliased shading. **Not** GBA, **not** HD-2D, **not** gritty/dark.

Every prompt is suffixed with:

> Chrono Trigger SNES JRPG pixel art, Akira Toriyama character design,
> 3/4 overhead view, expressive rounded features, spiky or flowing hair,
> warm saturated palette, soft dark outlines (no pure black), clean
> anti-aliased shading, transparent background, centered, full character
> visible

Negative prompt (always applied):

> blurry, modern anti-aliasing, 3d render, photorealistic, text,
> watermark, extra limbs, cropped, gritty, dark, realistic proportions,
> GBA style, HD-2D

## Default model

`rd_fast__default` for iteration (cheap, fast). Upgrade individual assets
to `rd_pro__default` only when the fast model can't hit the target.

Alternate styles available (use via `--style`):

- `rd_plus__topdown_asset` — ¾-view game-ready character/prop sprites
- `rd_plus__topdown_map` — overhead environment tiles / map chunks
- `rd_plus__character_turnaround` — multi-angle sheets for one character
- `rd_fast__simple` — flatter, fewer details (cheap tile iteration)
- `rd_fast__portrait` — dialogue portraits
- `animation__walking_and_idle` — animated walk + idle cycles
- `animation__four_angle_walking` — 4-direction walk sheet

Full slug list lives in the Retro Diffusion API docs; these are the ones
we expect to use most.

## Resolutions (locked)

| Asset class          | Size      | Notes                                   |
| -------------------- | --------- | --------------------------------------- |
| Character sprite     | 64 × 64   | single pose; sheets assembled in post   |
| Enemy sprite (small) | 64 × 64   | goblin, slime, rat                      |
| Enemy sprite (large) | 128 × 128 | bosses, ogres                           |
| Tile                 | 32 × 32   | overworld terrain                       |
| Portrait (dialogue)  | 128 × 128 | NPC talking heads                       |
| UI icon              | 32 × 32   | items, status effects                   |

Display is pixel-perfect scaled in Phaser; never sub-pixel.

## Palette

We do **not** hard-constrain palette at generation time — Retro Diffusion
already produces a tight palette, and over-constraining hurts quality.
Post-processing (Session 3+) will optionally quantize to a shared 32-color
palette for the whole game. Until then, accept what the model returns.

If/when we lock a palette it will live at
`tools/asset-pipeline/palette.hex` and be applied as a post-processing
step registered in the manifest.

## Manifest rule

Every generated asset **must** be registered in
`tools/asset-pipeline/manifest.json` with prompt, seed, model, and any
processing steps. No orphan PNGs in `public/assets/`. The pipeline does
this automatically — do not drop PNGs in by hand.
