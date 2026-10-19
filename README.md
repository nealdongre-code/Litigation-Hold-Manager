# Litigation Hold Manager — MVP preview

A private, owner-only app for personnel-file holds. Includes a hold register, employee assignments, HR preservation confirmations, explicit release / extension / further-review decisions, activity history, CSV export, and downloadable all-day ICS reminders.

## Current boundaries

This version is a private workflow preview. All permitted signed-in visitors share one legal workspace. The Site is initially owner-private; no additional users have been granted access. Recipients need Site access before emailed links can be used. Separate legal and HR roles are not implemented. Start with fictional data. The interface starts with sample records and offers an explicit clear-sample action.

No personnel documents are uploaded. Releasing a matter does not mark files covered by another active hold as unprotected. No calendar or date-based automatic release occurs.

## Email

The outbox prepares deduplicated drafts at 30 days, 7 days, and daily after the review date. Preparation is manual in this preview. Automatic unattended scheduling is not yet implemented or enabled.

The send endpoint uses the [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email). Set `RESEND_API_KEY` as a secret and `EMAIL_FROM` to an authorized sender using Sites environment tools; redeploy to apply them. No credentials are bundled. Sample data cannot send email. The user reviews and confirms a recipient before each send. The email contains the hold ID, review date, and application link only.

Provider acceptance is recorded as such, not as confirmed delivery. A send is claimed before the network call to prevent concurrent sends. Failed, uncertain, or stuck sending attempts require inspecting the provider log; no automatic retry risks duplicate notices. Provider idempotency keys are per request.

## Calendar reminders

ICS files use stable hold UIDs, all-day review dates, CRLF line endings, UTF-8 line folding, private classification, and a one-day reminder. No employee names or matter descriptions appear in calendar exports. Imported Outlook reminders are independent; users may have to replace older events after extensions. Actual Outlook import has not been tested.

## Development

Node >=22.13 and pnpm 11.25.0. `pnpm install`, `pnpm db:generate`, `pnpm build`, then apply pending local migrations with the Wrangler command described below. `pnpm start` previews the built Worker at loopback. Hosted authentication is managed by Sites; APIs reject anonymous callers, and all permitted visitors access the shared legal workspace. Browser mutations require matching Origin and current revision.

```
node --test lib/domain.test.mjs
node node_modules/typescript/bin/tsc --noEmit
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_hot_the_spike.sql
```

D1 migrations are generated from `db/schema.ts`. Hosted publication applies migrations. Workspace updates use optimistic revision checks to reject stale edits. History is stored alongside records and is not an independently tamper-proof audit archive. Release records cannot be edited through the UI. A future multiuser version needs matter-level authorization, an immutable audit trail, recipient access, automatic reminder scheduling, delivery monitoring, backup and restore, and deployment review before storing real personnel information.

## Public demonstration on GitHub Pages

[**Try the demo**](https://nealdongre-code.github.io/Litigation-Hold-Manager/)

The public demo requires no account. It uses fictional sample records and stores each visitor's changes in that browser's local storage. It does not connect to the private Worker, D1 database, or Resend. “Simulate email” records a demonstration event without sending anything. CSV and ICS downloads work locally. Use **Reset demo** to restore sample records, or **Start an empty workspace** to explore from scratch. Do not enter real personnel information. Browser storage must be enabled; clearing site data removes local changes. Tabs in the same browser share storage; use one tab at a time.

To enable hosting, make this repository public, then go to **Settings → Pages → Build and deployment → Source → GitHub Actions**. Push to `main` or run **Actions → Deploy public demo to GitHub Pages → Run workflow**. After the deployment succeeds, the link above will be live. No application secrets or Cloudflare account are needed for the demo. The workflow deploys only `dist/demo`; the private application remains a separate deployment.

Local commands (Node >=22.13, pnpm 11.25.0):

```sh
pnpm install --frozen-lockfile
pnpm demo:test
pnpm demo:build
pnpm demo:preview
```

Open the preview's `/Litigation-Hold-Manager/` path. For live editing, use `pnpm demo:dev`. The base path is set in `demo/vite.config.ts`; update it and this README if the repository is renamed. No server-side routes or authentication are bundled in this static entry point.
