# Validation record

## Static release gate

The generated source passes the complete dependency-free release gate:

```bash
npm run verify:static
```

The gate currently verifies:

- Server module syntax: 18 files
- JavaScript/JSX parsing: 210 files (including verification scripts)
- Public/admin App Router pages and hostname rewrites
- Original backend route parity: 36 public routes and 120 admin routes
- Restored protected admin password route: 1 additional route
- Frontend/API contract: 129 statically resolved requests, 0 unresolved
- Database contract: 46 schema tables, 43 referenced tables and 285 checked query calls
- Declared package contract: all active bare imports are present in `package.json`
- Environment contract: all 50 referenced variables are documented or platform-provided
- Credential hygiene: no private keys, credential URLs, JWT literals or non-example `.env` files
- Local import resolution: 182 application modules
- Literal local asset references: 258 source files checked
- Migration integrity: 197 application source files, required routes/assets and controller exports

The schema was also compared privately with the original environment files. None of the nontrivial original credential values is included in this project.

## Install and production build

The final framework build requires npm packages. Run this in a normal development, CI or Vercel environment with registry access:

```bash
npm install
npm run verify
```

`npm run verify` executes the complete static release gate and then `next build`. Linting is available separately:

```bash
npm run quality
```

The conversion container could not install packages because its npm mirror did not contain `@tailwindcss/postcss`, the package was not cached offline, and public-registry DNS was unavailable. Therefore no claim is made that a production build was executed inside this container.

## External integration validation

These checks require staging credentials and network access to the actual services:

1. MySQL/MariaDB connection and schema import
2. Initial admin seeding and JWT cookie lifecycle
3. FTP create, append, size, delete and public URL permissions
4. SMTP delivery and sender authorization
5. Google OAuth origin/client configuration
6. Vapi public key and assistant configuration
7. Google Analytics measurement configuration
8. Vercel domain assignment and DNS for both hostnames

## Functional smoke test

### Public website

- Load every navigation page and all dynamic slug types
- Search organizations and open organization details
- Filter organizations by category/sector
- Submit contact and organization inquiry forms
- Submit volunteer, job, contributed story and donation forms
- Complete Google login for organization registration
- Upload a logo and multiple supporting documents
- Confirm database records, FTP URLs and notification emails

### Admin dashboard

- Login, session refresh, logout and expired-session redirect
- View/update profile and change password
- Create, edit, soft-delete and view organizations
- Create/edit/delete blogs, success stories, videos, certifications, testimonials and events
- Manage inquiries, donations, stories, jobs, volunteers and contact messages
- Manage topbar, telephone, sectors, carousel, welcome, vision/mission, descriptions, About content, SEO, FAQs, footer and bank data
- Review/delete organization registrations and open uploaded files
- Upload one image, one PDF and one representative large video

## Release decision

Deploy to a Vercel preview first. Promote to production only after `npm run verify` succeeds and the two smoke-test sections pass against staging DB, FTP, mail, OAuth and Vapi services.
