# Khudii Unified Next.js Application

This repository unifies the four supplied Khudii applications into one Next.js App Router project while preserving both existing interfaces:

1. Public React frontend
2. Public Express backend
3. Admin React frontend
4. Admin Express backend

## Production domains

- Public website: `https://khudii.com`
- Admin dashboard: `https://admin.khudii.com`

Attach both domains to the same Vercel project. `src/proxy.js` selects the public or admin route tree from the hostname and dispatches same-origin API calls to the matching backend registry.

## What is included

- Native Next.js App Router pages and layouts
- Preserved public website design and responsive CSS
- Preserved admin dashboard design and workflows
- Public and protected admin Route Handlers
- MySQL/MariaDB integration
- JWT cookie authentication
- FTP upload, append and deletion utilities
- Chunked large-file uploads for Vercel
- SMTP/email notification workflows
- Google OAuth, Google Analytics and Vapi browser integrations
- Structure-only database schema
- Deterministic admin-account seeder
- Static release verification suite

## Project structure

```text
src/
  app/
    (public)/                 Public App Router pages
    __admin/                  Internal admin App Router pages
    __api/[[...path]]/        Unified public/admin API dispatcher
    __media/chunk/            Chunked FTP upload endpoint
  components/                 Next.js shells and dynamic route loaders
  legacy/public/              Preserved public UI source
  legacy/admin/               Preserved admin UI source
  lib/                        Navigation, auth, OAuth and upload adapters
  server/                     Controllers, route registries, DB, FTP and mail
public/                       Preserved site/admin assets
database/schema.sql           Structure-only MySQL/MariaDB schema
scripts/                      Verification and setup scripts
```

The `legacy` name means “preserved UI source,” not a second runtime. Vite entry files, React Router roots and Express listeners are not used.

## Local setup

1. Install Node.js 20.9 or later.
2. Copy `.env.example` to `.env.local`.
3. Configure DB, JWT, FTP and integration values.
4. Import `database/schema.sql` into the database selected by `DB_NAME`.
5. Install packages, seed the first admin, verify and start:

```bash
npm install
npm run seed:admin
npm run verify
npm run dev
```

Open:

- Public: `http://localhost:3000`
- Admin: `http://admin.localhost:3000`

Where `admin.localhost` is unavailable, set `FORCE_ADMIN_HOST=1` and open `http://localhost:3000` for the admin surface.

## Minimum production environment

```env
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASS=
DB_NAME=
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

JWT_SECRET=

FTP_HOST=
FTP_PORT=21
FTP_USER=
FTP_PASS=
FTP_SECURE=false
FTP_UPLOAD_DIR=/media
FTP_BASE_URL=https://media.khudii.com

NEXT_PUBLIC_SITE_URL=https://khudii.com
NEXT_PUBLIC_ADMIN_URL=https://admin.khudii.com
NEXT_PUBLIC_BACKEND_PATH=
```

Browser integrations:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GA_TRACKING_ID=
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
```

Mail can be set through the SMTP variables in `.env.example`; authenticated owner-table settings remain supported.

## First admin account

Set temporary seed values:

```env
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=replace-with-a-long-password
```

Then run:

```bash
npm run seed:admin
```

Remove `ADMIN_SEED_PASSWORD` from local/hosted environment settings after seeding.

## FTP uploads

Browser data URLs are intercepted and uploaded through `POST /__media/chunk`. The route writes sequential chunks to FTP and returns a final media URL before the original form request is submitted.

```env
MAX_UPLOAD_BYTES=524288000
MAX_UPLOAD_CHUNK_BYTES=2621440
FTP_TIMEOUT_MS=300000
```

Supported retained workflows include images, videos, PDFs, Word documents, Excel files and text files. The FTP server must support upload, append, size and deletion operations and expose uploaded files over HTTPS through `FTP_BASE_URL`.

## Verification commands

```bash
# Dependency-free source/contract checks
npm run verify:static

# Static checks plus production Next.js build
npm run verify

# ESLint quality report
npm run quality
```

The static suite checks route parity, 129 frontend API calls, 285 SQL calls, package imports, environment variables, credentials, local imports and assets. See `VALIDATION.md` for exact results and the staging smoke-test checklist.

## Deployment

Use one Vercel project and attach both production domains. Full instructions are in `VERCEL_DEPLOYMENT.md`.
