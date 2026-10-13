# TURBZ3

Canvas action-RPG built with TanStack Start + Vite.

## Develop

```bash
npm install
npm run dev        # http://localhost:8080
npm run typecheck
npm test
```

The female-human character art (`public/CharacterPack`) and map assets
(`public/MapAssets`) are fetched at build time by `scripts/fetch-character-pack.mjs`
and `scripts/fetch-map-assets.mjs`.

## Gathering / resource nodes

Ore veins, trees, mushroom patches and fishing spots are defined in `POIS`
(`src/game/content.ts`) and drawn live by `src/game/resource-nodes.ts` (each kind
has its own sprite). Gathering a node removes it from the world; it grows back
after `NODE_RESPAWN_SECONDS`. Nodes are intentionally **not** baked into the
world cache so they can vanish.

## Character armor layers

All worn armor layers (chest, boots, gloves, helm, hair) share the body's anchor
and scale in `src/game/character-sprite.ts` (`LAYER_OY`) because the pack sprites
are authored on one shared 32x32 canvas.
