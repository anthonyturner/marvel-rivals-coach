# Marvel Rivals Coach

Marvel Rivals Coach is an Angular companion site for learning heroes, matchups, positioning concepts, media guides, and practice habits for Marvel Rivals. The app is built as a coaching reference instead of a static wiki clone: it combines hero data, ability details, glossary terms, video resources, guide-based lessons, and guided learning paths into one searchable site.

## What The App Includes

- A landing page with current Marvel Rivals news and battle pass content.
- Database-backed home page content blocks for stats, news cards, portal cards, featured guides, quick links, and current focus copy.
- A hero encyclopedia with role filters, search, row/thumb layouts, hero detail modals, video embeds, counters, synergies, strengths, weaknesses, playstyle notes, and full ability kits.
- Database-backed hero video mappings for PAZ gameplay and counters/combos embeds.
- Ability cards with technical details such as energy cost, cooldown, damage, range, projectile speed, duration, healing, and other parsed stat rows.
- Multi-role hero support, including Deadpool role pools for Vanguard, Duelist/DPS, and Strategist/Support.
- A glossary of coaching and Marvel Rivals terms.
- Technique pages generated from the provided OW2/Marvel Rivals coaching spreadsheet.
- Guide pages for Power Positions and Strategic Cover Usage.
- Media tutorials with embedded YouTube videos and related guide links.
- Learning paths, practice-oriented coaching content, and a "What Should I Watch Next?" quiz.
- Hourly database-backed game-stat snapshots with previous-snapshot trend comparisons.

## Main Pages

| Route | Purpose |
| --- | --- |
| `/` | Home page with featured site content and news-style sections |
| `/heroes` | Database-backed hero roster, filters, ability details, and video guides |
| `/glossary` | Coaching and gameplay terminology |
| `/techniques` | Technique guide content from the coaching materials spreadsheet |
| `/power-positions` | Clean guide content for power positions |
| `/strategic-cover` | Clean guide content for strategic cover usage |
| `/learning-paths` | Curated learning paths for improving at the game |
| `/media-tutorials` | Embedded tutorial videos and related guide links |
| `/watch-next` | Quiz that recommends what to study next |
| `/game-stats` | Current Steam snapshot with stored historical comparisons |

## Tech Stack

- Angular 20
- Angular SSR
- Express server
- TypeScript
- RxJS
- Angular Signals
- Turso/libSQL through `@tursodatabase/serverless`
- Steam News and Fandom/wiki sync scripts for refreshable hero and news data

## Content Architecture

The site reads runtime content from one shared Turso/libSQL database through API routes exposed by the SSR server.

```text
Seed JSON + Fandom/wiki APIs -> Turso/libSQL -> Express API -> Angular pages
```

Local development and Vercel production should use the same Turso database credentials:

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

Keep those values in `.env` locally and in Vercel Project Settings for production. Do not commit real Turso tokens.

Important files:

| File | Purpose |
| --- | --- |
| `scripts/sqlite-schema.sql` | SQLite table schema |
| `scripts/seed-sqlite.mjs` | Seeds Turso from local mock JSON |
| `scripts/sync-heroes.mjs` | Fetches and updates Turso hero data from Marvel Rivals Fandom |
| `scripts/sync-official-heroes.mjs` | Fetches official Marvel Rivals hero descriptions, Season 9 abilities, and team-up abilities |
| `scripts/sync-external-sources.mjs` | Caches external source payloads in Turso |
| `scripts/sync-home-news.mjs` | Refreshes official updates, tuning, and events from the Marvel Rivals site |
| `scripts/sync-game-stats.mjs` | Captures an hourly game-stat snapshot and compares it with the previous sample |
| `scripts/sync-glossary-missing.mjs` | Inserts glossary terms that exist in local JSON but are missing from Turso |
| `scripts/sync-glossary-terms.mjs` | Upserts specific glossary terms by ID or term text |
| `scripts/refresh-counter-picks.mjs` | Rebuilds the curated "who stops this hero" counter matrix |
| `scripts/refresh-playstyles.mjs` | Regenerates hero playstyle copy from current Turso content |
| `src/app/data/hero-videos.mock.json` | Seed data for hero-specific and role-fallback video embeds |
| `src/app/data/home-content.mock.json` | Seed data for home stats, news, guides, quick links, and focus copy |
| `src/app/data/home-portals.mock.json` | Seed data for home portal cards |
| `scripts/turso-client.mjs` | Shared Turso client helper for scripts |
| `src/content-database.ts` | Server-side Turso read helpers |
| `src/server.ts` | Express API and SSR server |

Available API routes include:

```text
GET /api/heroes
GET /api/heroes/:id
GET /api/hero-videos
GET /api/home/content
GET /api/home/portals
GET /api/sync/home-news
GET /api/glossary
GET /api/external-sources/:sourceKey
GET /api/content/status
```

## Local Setup

Install dependencies:

```powershell
npm.cmd install
```

Create a local environment file from the safe example:

```powershell
Copy-Item .env.example .env
```

Fill in `.env` with your Turso credentials:

```env
TURSO_DATABASE_URL=libsql://your-database-your-org.turso.io
TURSO_AUTH_TOKEN=your-token
```

Create or refresh the shared Turso content database:

```powershell
npm.cmd run content:update
```

Start the development server:

```powershell
npm.cmd start
```

Open:

```text
http://localhost:4200/
```

## Content Update Scripts

Run these commands from the project folder:

```powershell
cd e:\repos\angular\marvel-rivals-coach\marvel-rivals-coach
```

Rebuild the Turso database from local mock JSON seed files:

```powershell
npm.cmd run db:seed
```

Pull current external source data into Turso:

```powershell
npm.cmd run db:sync
```

Refresh the home page Season and BattlePass notes:

```powershell
npm.cmd run sync:home-news
```

Insert glossary terms that exist in `src/app/data/glossary.mock.json` but are missing from Turso:

```powershell
npm.cmd run sync:glossary:missing
```

Upsert one or more glossary terms without a full reseed:

```powershell
npm.cmd run sync:glossary:terms -- glnm another-term-id
```

Refresh the curated hero counter picks:

```powershell
npm.cmd run refresh:counters
```

Pull current hero data and ability details from Fandom into Turso:

```powershell
npm.cmd run sync:heroes
```

Pull official Season 9 hero descriptions, ability kits, and team-up abilities into Turso:

```powershell
npm.cmd run sync:official-heroes
```

Check the official heroes page for added, changed, or removed hero data without applying hero row updates:

```powershell
npm.cmd run check:official-heroes
```

Run the same official-site update loop every three days from a long-lived shell:

```powershell
npm.cmd run watch:official-heroes
```

Refresh generated hero playstyle text from current Turso data:

```powershell
npm.cmd run refresh:playstyles
```

Run the full content refresh pipeline:

```powershell
npm.cmd run content:update
```

## Home News Updates

The home page `Season and BattlePass notes` section is database-backed. The refresh flow is:

```text
Official Marvel Rivals news and patch notes -> Turso -> /api/home/content -> Angular home page
```

The official Marvel Rivals homepage supplies the newest announcements and latest balance post. The newest official patch note supplies current event and reward cards. The app keeps safe fallback content if the source or cached API is temporarily unavailable. Most-used heroes come from the separately cached Rivals Meta tier-list feed.

For production, `vercel.json` includes a cron that calls:

```text
/api/sync/home-news
```

The cron runs every six hours and updates the shared Turso database. For a manual production refresh, set a `SYNC_SECRET` environment variable in Vercel and call the endpoint with:

```powershell
Invoke-RestMethod -Uri "https://your-site.vercel.app/api/sync/home-news" -Headers @{ Authorization = "Bearer YOUR_SYNC_SECRET" }
```

For local refreshes, run:

```powershell
npm.cmd run sync:home-news
```

## Game Stats Snapshot History

Game Stats captures at most one database snapshot per UTC hour. Each snapshot stores the tracked games' current players, 24-hour peak, all-time peak, Steam daily rank, seller rank, review signal, and source URL. The API compares the incoming values with the immediately preceding stored snapshot and returns metric deltas plus a plain-language read.

Vercel calls the protected sync endpoint hourly:

```text
/api/sync/game-stats
```

For a manual local capture, run:

```powershell
npm.cmd run sync:game-stats
```

The first capture establishes the baseline. Starting with the next hourly capture, `/api/game-stats` and the Game Stats page show changes against the previous sample. The runtime sync creates its tables when needed; `scripts/sqlite-schema.sql` also contains them for new database setup.

Typical hero-content refresh:

```powershell
npm.cmd run sync:heroes
npm.cmd run refresh:playstyles
```

Restart the dev server after updating the database if you already had it running.

## Vercel Deployment

Vercel reads `vercel.json` and runs:

```powershell
npm run vercel:build
```

That command runs the normal Angular/API build first:

```powershell
npm run build
```

Then it runs a production-only missing glossary sync:

```powershell
npm run sync:glossary:missing -- --vercel-production-only
```

The glossary sync only writes during production Vercel builds (`VERCEL_ENV=production`). Preview builds and local runs of `vercel:build` skip that database write. The sync inserts glossary rows whose IDs exist in `src/app/data/glossary.mock.json` but are missing from Turso. It does not update existing glossary rows and does not delete anything.

Deploys do not run the full seed or content refresh pipeline. These commands remain manual/admin operations:

```text
npm run db:seed
npm run content:update
npm run sync:glossary
npm run sync:glossary:terms -- glnm
```

For routing, `/api/*` files deploy as Vercel serverless functions. Non-API routes are rewritten to `index.csr.html`, so Angular handles app navigation.

## Turso Setup

Install the Turso CLI. On Windows, Turso recommends using WSL:

```powershell
wsl
curl -sSfL https://get.tur.so/install.sh | bash
```

Authenticate:

```bash
turso auth login
```

Create the shared database:

```bash
turso db create marvel-rivals-coach
```

Get the database URL:

```bash
turso db show --url marvel-rivals-coach
```

Create an auth token:

```bash
turso db tokens create marvel-rivals-coach
```

Put those values into local `.env`:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Seed and sync the database:

```powershell
npm.cmd run content:update
npm.cmd run refresh:playstyles
```

For Vercel, add the same two variables in Project Settings -> Environment Variables:

```text
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
```

## Database And GitHub Safety

Local database exports/backups should not be committed:

```text
data/*.db
data/*.db-*
```

Environment files are also ignored:

```text
.env
.env.*
```

Commit `.env.example`, but never commit real API keys, tokens, passwords, private deployment settings, or machine-specific paths.

Files that should stay out of GitHub:

- `.env` and `.env.*`
- `data/*.db`
- `node_modules/`
- `dist/`
- `.angular/`
- `tmp-*`
- local dev logs

## Build

Create a production build:

```powershell
npm.cmd run build
```

The build output is written to:

```text
dist/marvel-rivals-coach
```

Run the built SSR server:

```powershell
npm.cmd run serve:ssr:marvel-rivals-coach
```

The SSR server uses `PORT` if set, otherwise it defaults to `4000`.

## Tests

Run unit tests:

```powershell
npm.cmd test
```

## Agile Workflow

Project planning lives in `docs/agile`. Start with `docs/agile/README.md`, then use `backlog.md` and `sprint-board.md` for day-to-day work. GitHub integration details for issues, pull requests, Actions, labels, and agents live in `docs/agile/github-integration.md`.

## Notes

- The app depends on Turso for runtime content.
- If `/api/content/status` reports that Turso is not configured, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
- If the Turso database is empty, run `npm.cmd run content:update`.
- The Fandom sync scripts require internet access.
