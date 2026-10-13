TURBZ Cloudflare package
- public/ is the game (index, assets, music).
- worker.js serves those files. /api returns 501.
- wrangler.toml binds ASSETS to ./public.

This pack is the offline build. Hunt progress and Witch Circle progress are stored separately in the browser. A game over in the Circle wipes only that save. Username login, cloud autosave, and lobbies still need the published TURBZ server, which keeps both saves on the same account. This worker does not run Better Auth.

Deploy: npx wrangler deploy
