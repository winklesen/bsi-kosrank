<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local development

- Read `docs/LOCAL_DEVELOPMENT.md` before starting the Docker stack.
- Build the app image, start `db`, run `docker compose run --rm app npx prisma db push` only against the new local KosRank database, then start `app`.
- Web defaults to host loopback port 3101; PostgreSQL defaults to host loopback port 55439. Override with `.env` if occupied.
- Do not run `prisma/seed.ts` automatically: it deletes existing records and creates example accounts.
- Stop project containers with `docker compose down`; do not remove volumes unless the user explicitly requests data deletion.
