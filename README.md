# Wine Pairing App — Cloud V19

Cloud browser version using Supabase Auth and Supabase database.

This package removes the `/api/config.js` serverless route and uses the public Supabase project URL/publishable key directly in `index.html`, which is fine for a browser app when Row Level Security is enabled.

Upload these files to the root of the GitHub repo:
- index.html
- vercel.json
- README.md
- supabase_schema.sql

Then redeploy on Vercel.
