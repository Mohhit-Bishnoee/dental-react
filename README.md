# Everwell Dental

React + Vite frontend with a Node/Express API, SQLite persistence, and live Server-Sent Events (SSE). Admin edits are stored centrally and pushed to connected public pages.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `ADMIN_EMAIL` to the single admin email and set `ADMIN_INITIAL_PASSWORD` to the chosen initial password. This password is server-side only and is never bundled into the frontend.
3. Run `npm install` and `npm run dev`. The command starts the frontend and API together.
4. Open the Vite URL shown in the terminal and use its **Admin login** link. There is no signup route.
5. Save the doctor names, roles, publicly accessible photo URLs, phone, email, address, and hours. All visitors then receive updates live.

The first server start creates a SQLite database at `backend/data/site.sqlite`; the database and password hash are excluded from git. Admin sessions use random, revocable server-side tokens. The initial admin email/password environment values are used only when the database has no admin account. Changing the password from the dashboard updates the server-side hash and invalidates other sessions.

## Production hosting (Render)

`render.yaml` defines a Node web service, HTTPS-ready production settings, a health check, and a persistent disk for SQLite. To publish:

1. Push this repository to GitHub and connect it in the Render dashboard using **New → Blueprint**.
2. Confirm the `everwell-dental` web service and persistent disk. The Starter plan is required for a persistent disk.
3. When Render prompts for `ADMIN_INITIAL_PASSWORD`, enter the initial password privately in Render's environment-variable setup; do not commit it or add it to the browser app.
4. Deploy and wait for the `/api/health` check to pass. Render builds the frontend and starts the API in the same Node service.
5. Open `https://<your-render-service>.onrender.com/admin`, sign in with the configured admin email and initial password, then edit and save the site content.

The SQLite database is stored on `/var/data/site.sqlite`, which is mounted from the persistent disk so edits and password changes survive redeploys. Render provides HTTPS, so production session cookies are Secure, HttpOnly, and SameSite=Strict.

Actual cloud publication must be initiated from an account with access to this GitHub repository and Render. A static-only host cannot run the API or persist edits.

The frontend only accepts the single admin account configured by `ADMIN_EMAIL`; there is no public signup. Admin can update the password after signing in. Doctor photos are entered as public image URLs; uploading image files is not included.

## Checks

```sh
npm run lint
npm run build
```
