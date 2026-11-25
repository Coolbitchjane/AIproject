# Find Your Perfect Look

An app that lets people try clothes on at home: pick a size and style and see whether it fits.

## What is in this repo (one Vercel project)
- `index.html` - the website prototype (Home, Measurements, Catalog, Try-on). Works on its own with sample data.
- `api/` and `server/` - Node + Express back end (login with hashed passwords and a JWT cookie, profile, catalog, size adjustment, recommendations, style match, try-ons).
- `sql/002_update.sql` - database update script for Supabase.
- `src/api.js`, `src/pages/MyTryOns.jsx` - front-end helper and page that call the API (for the future React version).
- `vercel.json` - sends `/api/*` to the back end.

## Deploy on Vercel
The site (`index.html`) works immediately. The API needs two environment variables in
Vercel > Settings > Environment Variables:
- `DATABASE_URL` - Supabase pooler connection string (port 6543)
- `JWT_SECRET` - a random string of at least 32 characters

Then run `sql/002_update.sql` in the Supabase SQL editor. Without these variables, `/api/*` returns an error but the website still loads.

## Run locally
```
npm install
npx vercel dev
```

## API routes
POST /api/auth/register | login | logout - GET /api/auth/me
GET, PUT /api/profile
GET /api/garments - GET /api/garments/:id - POST /api/garments (admin)
GET /api/size/recommend - POST /api/size/adjust
GET /api/recommendations - GET /api/style-match
POST, GET /api/tryons - PATCH /api/tryons/:id

Make an admin: `UPDATE users SET role = 'admin' WHERE email = 'you@example.com';`
