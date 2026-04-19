#!/usr/bin/env node
// Asset pipeline: generate a pixel-art sprite via the Retro Diffusion API,
// write the PNG to public/assets/<type>/<name>.png, and register it in
// manifest.json (rule 3 from .claude/CLAUDE.md — no orphan PNGs).
//
// Usage:
//   pnpm asset:new --name player_idle_down --prompt "..." [options]
//
// Options:
//   --name <string>       asset name (required, kebab/snake case)
//   --prompt <string>     positive prompt (required)
//   --type <string>       sprites | tilesets | ui | portraits  (default: sprites)
//   --style <string>      RD prompt_style slug       (default: rd_fast__default)
//   --width <int>         output width in pixels     (default: 64)
//   --height <int>        output height in pixels    (default: 64)
//   --seed <int>          RNG seed                   (default: random)
//   --force               overwrite existing file + manifest entry
//   --dry-run             estimate cost only (check_cost=true), no image generated

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const MANIFEST_PATH = join(__dirname, 'manifest.json');
const ASSETS_ROOT = join(REPO_ROOT, 'public', 'assets');
const API_URL = 'https://api.retrodiffusion.ai/v1/inferences';

// Project-wide style lock (see docs/design/04-art-direction.md).
// Reference: Chrono Trigger (SNES, 1995) — Toriyama character design,
// ¾ overhead camera, warm saturated palette, soft outlines.
const STYLE_SUFFIX =
  'Chrono Trigger SNES JRPG pixel art, Akira Toriyama character design, 3/4 overhead view, expressive rounded features, spiky or flowing hair, warm saturated palette, soft dark outlines (no pure black), clean anti-aliased shading, transparent background, centered, full character visible';
const NEGATIVE_PROMPT =
  'blurry, modern anti-aliasing, 3d render, photorealistic, text, watermark, extra limbs, cropped, gritty, dark, realistic proportions, GBA style, HD-2D';

const VALID_TYPES = new Set(['sprites', 'tilesets', 'ui', 'portraits']);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'force' || key === 'dry-run') {
      args[key] = true;
    } else {
      args[key] = argv[++i];
    }
  }
  return args;
}

function fail(msg) {
  console.error(`\x1b[31merror:\x1b[0m ${msg}`);
  process.exit(1);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function loadManifest() {
  const raw = await readFile(MANIFEST_PATH, 'utf8');
  return JSON.parse(raw);
}

async function saveManifest(manifest) {
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.name) fail('--name is required');
  if (!args.prompt) fail('--prompt is required');

  const token = process.env.RETRO_DIFFUSION_API_KEY;
  if (!token) fail('RETRO_DIFFUSION_API_KEY missing. Run via `pnpm asset:new ...` which loads .env.');

  const type = args.type ?? 'sprites';
  if (!VALID_TYPES.has(type)) fail(`--type must be one of: ${[...VALID_TYPES].join(', ')}`);

  const width = parseInt(args.width ?? '64', 10);
  const height = parseInt(args.height ?? '64', 10);
  const style = args.style ?? 'rd_fast__default';
  const seed = args.seed ? parseInt(args.seed, 10) : Math.floor(Math.random() * 2_147_483_647);
  const dryRun = Boolean(args['dry-run']);
  const force = Boolean(args.force);

  const fullPrompt = `${args.prompt}, ${STYLE_SUFFIX}`;

  const outDir = join(ASSETS_ROOT, type);
  const outPath = join(outDir, `${args.name}.png`);
  const relPath = `public/assets/${type}/${args.name}.png`;

  const manifest = await loadManifest();
  const existing = manifest.assets.find((a) => a.name === args.name);
  if (existing && !force && !dryRun) {
    fail(`asset "${args.name}" already in manifest. Use --force to overwrite, or reuse it.`);
  }
  if ((await exists(outPath)) && !force && !dryRun) {
    fail(`file exists: ${relPath}. Use --force to overwrite.`);
  }

  const body = {
    width,
    height,
    prompt: fullPrompt,
    negative_prompt: NEGATIVE_PROMPT,
    prompt_style: style,
    num_images: 1,
    seed,
    check_cost: dryRun,
  };

  console.log(`→ POST ${API_URL}`);
  console.log(`  name=${args.name} type=${type} size=${width}x${height} style=${style} seed=${seed}${dryRun ? ' [DRY RUN]' : ''}`);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RD-Token': token,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) fail(`API ${res.status}: ${text}`);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    fail(`non-JSON response: ${text.slice(0, 400)}`);
  }

  if (dryRun) {
    console.log(`✓ estimated cost: ${data.credit_cost ?? data.balance_cost ?? '?'} credits`);
    console.log(`  remaining balance: ${data.remaining_credits ?? data.remaining_balance ?? '?'}`);
    return;
  }

  const b64 = data.base64_images?.[0];
  if (!b64) fail(`no base64_images in response: ${text.slice(0, 400)}`);

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, Buffer.from(b64, 'base64'));

  const record = {
    name: args.name,
    type,
    path: relPath,
    width,
    height,
    provider: 'retro-diffusion',
    model: style,
    prompt: args.prompt,
    full_prompt: fullPrompt,
    negative_prompt: NEGATIVE_PROMPT,
    seed,
    processing: [],
    credit_cost: data.credit_cost ?? data.balance_cost ?? null,
    generated_at: new Date().toISOString(),
  };

  if (existing) {
    Object.assign(existing, record);
  } else {
    manifest.assets.push(record);
  }
  await saveManifest(manifest);

  console.log(`✓ wrote ${relPath}`);
  console.log(`✓ manifest updated (${manifest.assets.length} assets)`);
  const bal = data.remaining_credits ?? data.remaining_balance;
  if (bal !== undefined) console.log(`  remaining balance: ${bal}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
