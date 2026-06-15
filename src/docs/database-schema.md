# Turso Content Database

The app uses one shared Turso/libSQL database for curated content and cached external API payloads.
The mock JSON files under `src/app/data` are seed inputs only; runtime pages read from the Express API backed by Turso.

## Connection

- Database URL: `TURSO_DATABASE_URL`
- Database token: `TURSO_AUTH_TOKEN`
- Schema: `scripts/sqlite-schema.sql`
- Seed script: `scripts/seed-sqlite.mjs`
- External sync script: `scripts/sync-external-sources.mjs`
- Hero wiki sync script: `scripts/sync-heroes.mjs`

Credentials are stored in `.env` locally and in Vercel environment variables for production.

Rebuild seeded content with:

```bash
npm run db:seed
```

Refresh seeded data and external source payloads with:

```bash
npm run content:update
```

Discover new Fandom heroes and upsert hero profile data with:

```bash
npm run sync:heroes
```

## Tables

### `heroes`

Stores one row per hero and keeps the complete source object in `raw_json` so the current Angular data model can be served without losing nested fields.

### `hero_list_items`

Stores repeated hero values:

- `strength`
- `weakness`
- `counter`
- `synergy`

### `hero_abilities`

Stores hero abilities. Default abilities use empty `kit_role` and `kit_label`; role-specific kits, such as Deadpool's Vanguard/Duelist/Strategist pools, set those fields.

### `glossary_terms`

Stores the glossary content and keeps the full source object in `raw_json`.

### `external_sources`

Stores cached payloads from external APIs such as Fandom. This lets the app read stable database-backed data while still giving us a refresh path.

### `sync_runs`

Stores update history for external sync jobs.

## API Routes

The Express SSR server exposes read-only routes:

- `GET /api/content/status`
- `GET /api/heroes`
- `GET /api/heroes/:id`
- `GET /api/glossary`
- `GET /api/external-sources/:sourceKey`

## Update Flow

1. Update curated JSON files or generator scripts.
2. Run `npm run db:seed` to rebuild Turso content tables.
3. Run `npm run db:sync` to refresh external source payloads.
4. Run `npm run sync:heroes` to discover and upsert current Fandom heroes.
5. Run `npm run build` to verify the app still compiles.

`npm run content:update` runs steps 2 through 4.

## Hero Sync Notes

The hero sync script:

- Reads `Category:Heroes` from Fandom.
- Fetches each hero page's wikitext.
- Skips pages that do not expose a valid hero role.
- Parses role, difficulty, official summary, strengths, weaknesses, synergies, and a compact ability list.
- Inserts new heroes into Turso.
- Updates existing heroes in Turso.
- Preserves curated fields that are hard to reconstruct automatically, such as Deadpool's role-specific ability kits and existing local image paths.
- Preserves existing counter arrays. If a brand-new hero has no curated counters yet, it receives broad role-based fallback counters until better matchup data is added.

New heroes without a local portrait use `/images/heroes/default-hero.png` until an image is added.
