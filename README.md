# Everwell Dental

React + Vite site with Vercel serverless admin endpoints. Production content is stored as a JSON file in the GitHub repository, not in a database. Saving a change commits that file to GitHub; Vercel's Git integration then builds and deploys the new version. Connected public pages poll for updates every ten seconds.

## Configure local development

1. Copy `.env.example` to `.env.local`.
2. Set `ADMIN_INITIAL_PASSWORD` to the initial password. The only accepted admin email is `mansi.s0824@gmail.com`.
3. Create a GitHub fine-grained access token restricted to this repository with **Contents: Read and write** permission. Put it in `GITHUB_CONTENT_TOKEN`; do not commit or expose the token.
4. Generate two different 32-byte (64 hex-character) keys:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Use one for `SESSION_SECRET` and the other for `ADMIN_PASSWORD_ENCRYPTION_KEY`.
5. Run `npm install` and `npm run dev`. Local development uses the local Express API and SQLite database.

## Set up Vercel production

1. Ensure the Vercel project is connected to this GitHub repository and uses the `main` production branch. Set the Vercel project's **Root Directory** to the repository root.
2. Open **Vercel → Project → Settings → Environment Variables**. Add each variable below for **Production** (and Preview only if you need preview deployments):
   - `GITHUB_CONTENT_TOKEN`: GitHub fine-grained token restricted to `Mohhit-Bishnoee/dental-react`, with repository **Contents: Read and write** permission.
   - `GITHUB_REPOSITORY`: `Mohhit-Bishnoee/dental-react` (optional; this is the default)
   - `GITHUB_BRANCH`: `main`
   - `ADMIN_INITIAL_PASSWORD`: the initial admin password, entered privately in Vercel.
   - `SESSION_SECRET`: a random 64-character hexadecimal secret.
   - `ADMIN_PASSWORD_ENCRYPTION_KEY`: a different random 64-character hexadecimal key.
3. Redeploy the latest Vercel deployment after all variables are set.
4. Check `https://<your-domain>/api/health` returns `{"ok":true}` and open `https://<your-domain>/admin`.
5. Sign in with `mansi.s0824@gmail.com` and the initial password. The first successful login writes the encrypted password record to `.admin/admin-password.enc.json` in the repository.
6. Save doctor names, roles, public photo URLs, phone, email, address, and opening hours. The API commits updates to `public/site-content.json`; that GitHub commit automatically starts a Vercel deployment. Visitors see the content once Vercel finishes deploying.

This uses GitHub repository files as storage, not a database. Public content is read from the repository's raw file endpoint; admin login and saves require the configured GitHub token and secrets. A successful edit creates a source commit and triggers a deployment; a live update is therefore subject to the Vercel build/deployment time, not guaranteed instant. Admin password changes are AES-256-GCM encrypted with `ADMIN_PASSWORD_ENCRYPTION_KEY` before the encrypted record is committed. Keep the GitHub token and both keys private. If any of these Vercel variables change or are lost, existing encrypted admin credentials may no longer be readable.

There is no public signup. Doctor photos must use publicly accessible image URLs. Passwords and GitHub tokens are never placed in the frontend bundle.

## Validation

```sh
npm run lint
npm run build
```
