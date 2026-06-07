# Wine Pairing App — Cloud V20

Cloud browser version using Supabase Auth and Supabase database.

V20 fixes:
- CSV imported wines now display on blank/new venue accounts.
- Wine cards no longer assume hard-coded `harvest` / `tasting` menu IDs.
- Assign-to-menu rows now work with any menu created in the app.
- Add menu and add course are protected from render errors.
- Delete all archived wines is wired up.
- Rendering is safer so one section error does not kill the whole app.

Deploy by replacing the root files in GitHub:
- index.html
- vercel.json
- README.md
- supabase_schema.sql

Do not upload config.js or api/config.js for this version.
