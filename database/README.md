# Database setup

`schema.sql` is a structure-only MySQL/MariaDB schema containing 46 tables. Production rows and secrets are intentionally not included.

Import it into an empty database, configure the `DB_*` environment variables, and run:

```bash
npm run seed:admin
```

The application can also connect to the existing Khudii database directly; in that case do not re-import the schema over production data.

The SQL uses `utf8mb4_unicode_ci` for broad MySQL/MariaDB compatibility.
