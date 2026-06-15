# Marvel Rivals Coach

Marvel Rivals Coach is an Angular companion site for learning heroes, matchups, positioning concepts, media guides, and practice habits for Marvel Rivals. The app is built as a coaching reference instead of a static wiki clone: it combines hero data, ability details, glossary terms, video resources, transcript-based guides, and guided learning paths into one searchable site.

## What The App Includes

- A landing page with current Marvel Rivals news and battle pass content.
- A hero encyclopedia with role filters, search, row/thumb layouts, hero detail modals, video embeds, counters, synergies, strengths, weaknesses, playstyle notes, and full ability kits.
- Ability cards with technical details such as energy cost, cooldown, damage, range, projectile speed, duration, healing, and other parsed stat rows.
- Multi-role hero support, including Deadpool role pools for Vanguard, Duelist/DPS, and Strategist/Support.
- A glossary of coaching and Marvel Rivals terms.
- Technique pages generated from the provided OW2/Marvel Rivals coaching spreadsheet.
- Transcript-based guide pages for Power Positions and Strategic Cover Usage.
- Media tutorials with embedded YouTube videos and transcript links.
- Learning paths, practice-oriented coaching content, and a "What Should I Watch Next?" quiz.

## Main Pages

| Route | Purpose |
| --- | --- |
| `/` | Home page with featured site content and news-style sections |
| `/heroes` | Database-backed hero roster, filters, ability details, and video guides |
| `/glossary` | Coaching and gameplay terminology |
| `/techniques` | Technique guide content from the coaching materials spreadsheet |
| `/power-positions` | Extracted guide content from the power positions transcript |
| `/strategic-cover` | Extracted guide content from the strategic cover transcript |
| `/learning-paths` | Curated learning paths for improving at the game |
| `/media-tutorials` | Embedded tutorial videos and related transcript links |
| `/watch-next` | Quiz that recommends what to study next |

## Tech Stack

- Angular 20
- Angular SSR
- Express server
- TypeScript
- RxJS
- Angular Signals
- Turso/libSQL through `@tursodatabase/serverless`
- Fandom/wiki sync scripts for refreshable hero and news data

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
| `scripts/sync-external-sources.mjs` | Caches external source payloads in Turso |
| `scripts/refresh-playstyles.mjs` | Regenerates hero playstyle copy from current Turso content |
| `scripts/turso-client.mjs` | Shared Turso client helper for scripts |
| `src/content-database.ts` | Server-side Turso read helpers |
| `src/server.ts` | Express API and SSR server |

Available API routes include:

```text
GET /api/heroes
GET /api/heroes/:id
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

Pull current hero data and ability details from Fandom into Turso:

```powershell
npm.cmd run sync:heroes
```

Refresh generated hero playstyle text from current Turso data:

```powershell
npm.cmd run refresh:playstyles
```

Run the full content refresh pipeline:

```powershell
npm.cmd run content:update
```

Typical hero-content refresh:

```powershell
npm.cmd run sync:heroes
npm.cmd run refresh:playstyles
```

Restart the dev server after updating the database if you already had it running.

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

## Notes

- The app depends on Turso for runtime content.
- If `/api/content/status` reports that Turso is not configured, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
- If the Turso database is empty, run `npm.cmd run content:update`.
- The Fandom sync scripts require internet access.
