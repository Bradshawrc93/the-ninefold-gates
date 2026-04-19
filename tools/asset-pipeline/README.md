# Asset Pipeline (stub)

The real pipeline lands in Session 3. It will:

1. Accept asset requests (name, type, prompt, seed, size, palette).
2. Call the Retro Diffusion API.
3. Post-process (crop, palette-quantize, split spritesheets).
4. Write the result to `public/assets/<type>/<name>.png`.
5. Register the asset in `manifest.json` with provider, prompt, seed, and
   processing steps.

**Rule (from `.claude/CLAUDE.md`, rule 3):** every generated asset must appear
in `manifest.json`. No orphan PNGs in `public/assets/`.

## manifest.json

`manifest.json` is the source of truth for every generated asset. Check it
before generating — if a matching asset exists, reuse it.
