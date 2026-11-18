# Find Your Perfect Look: back end (Node + Express on Vercel)

## Set up
1. In the Supabase SQL editor run your original schema, then `sql/002_update.sql`.
2. Copy `.env.example` to `.env.local` and fill in DATABASE_URL (Supabase pooler string, port 6543) and JWT_SECRET.
3. `npm install`
4. `npx vercel dev`  (front end + API at http://localhost:3000)
5. Deploy: `npx vercel --prod`, and add the same two variables in Vercel > Settings > Environment Variables.

## Merge into your React/Vite project
Copy `api/`, `server/`, `sql/`, `vercel.json` into your project root, copy `src/api.js` and
`src/pages/MyTryOns.jsx` into your `src/`, and merge the dependencies from `package.json`.

## Routes
POST /api/auth/register | login | logout   GET /api/auth/me
GET, PUT /api/profile
GET /api/garments?style=&department=   GET /api/garments/:id   POST /api/garments (admin)
GET /api/size/recommend?garment_id=   POST /api/size/adjust
GET /api/recommendations?style=&limit=
GET /api/style-match?garment_id=
POST, GET /api/tryons   PATCH /api/tryons/:id

## Make an admin
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
