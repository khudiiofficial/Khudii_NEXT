# Vercel deployment

## 1. Create one project

Import this repository into one Vercel project using the standard Next.js framework preset. Do not create separate public and admin deployments.

## 2. Add domains

Attach both domains to the same project:

```text
khudii.com
admin.khudii.com
```

The hostname-aware `src/proxy.js` sends public requests to the public App Router tree and admin requests to the internal `__admin` tree.

## 3. Add environment variables

Configure all values from `.env.example` in Vercel Project Settings for Production and the appropriate Preview environments. Leave `NEXT_PUBLIC_BACKEND_PATH` empty because APIs are served by the same deployment.

Generate a long random `JWT_SECRET`. Do not reuse a database, FTP, mail or Google secret.

## 4. Database

Use a MySQL/MariaDB service reachable from Vercel. Import `database/schema.sql`, then seed the first admin account from a trusted local or CI environment:

```bash
npm run seed:admin
```

Remove `ADMIN_SEED_PASSWORD` after seeding.

## 5. FTP

The FTP account must permit:

- login from Vercel outbound connections
- creation/access of `FTP_UPLOAD_DIR`
- overwrite/append for chunked uploads
- delete for admin media replacement/deletion
- public HTTPS access through `FTP_BASE_URL`

For FTPS, set `FTP_SECURE=true` and ensure the server certificate/connection mode is supported by `basic-ftp`.

## 6. Build

Use:

```text
Build command: npm run build
Install command: npm install
Output: Next.js default
```

Node.js must be 20.9 or later.

## 7. Post-deployment smoke test

Test the public and admin checklists in `VALIDATION.md` on a staging deployment before assigning production DNS. In particular, upload one image, one PDF and one representative video, because FTP permissions and serverless networking vary by provider.
