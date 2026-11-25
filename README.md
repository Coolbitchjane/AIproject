# Find Your Perfect Look

An app that lets people try clothes on at home: pick a size and style and see whether it fits.

- `index.html` — the website prototype at the repo root, so Vercel serves it straight away. Home, Measurements, Catalog, Try-on.
- `backend/` — Node + Express API for Vercel (login with hashed passwords and JWT cookie, profile, catalog, size adjustment, recommendations, style match, try-ons) and `sql/002_update.sql`. See `backend/README.md`.
