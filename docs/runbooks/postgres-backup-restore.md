# Runbook: Postgres backup & restore

**Service:** Docker Compose service `postgres` (`zeemkolo_postgres`)  
**Defaults:** user `zeemkolo_admin`, db `zeemkolo_db` (override via `.env`)

## Backup (`pg_dump`)

From the repo root (PowerShell-friendly):

```bash
mkdir -p backups
docker exec zeemkolo_postgres pg_dump -U zeemkolo_admin -d zeemkolo_db --clean --if-exists -F p > backups/zeemkolo_db_YYYYMMDD.sql
```

Custom format (for `pg_restore`):

```bash
docker exec zeemkolo_postgres pg_dump -U zeemkolo_admin -d zeemkolo_db -F c -f /tmp/zeemkolo.dump
docker cp zeemkolo_postgres:/tmp/zeemkolo.dump ./backups/zeemkolo_db_YYYYMMDD.dump
```

`backups/` is gitignored — do not commit dumps.

## Restore (plain SQL)

**Warning:** destructive to local data.

```bash
# Optional: stop API writers first
pnpm db:up
Get-Content .\backups\zeemkolo_db_YYYYMMDD.sql | docker exec -i zeemkolo_postgres psql -U zeemkolo_admin -d zeemkolo_db
```

## Restore (custom format)

```bash
docker cp ./backups/zeemkolo_db_YYYYMMDD.dump zeemkolo_postgres:/tmp/restore.dump
docker exec zeemkolo_postgres pg_restore -U zeemkolo_admin -d zeemkolo_db --clean --if-exists /tmp/restore.dump
```

## Verify

```bash
docker exec zeemkolo_postgres psql -U zeemkolo_admin -d zeemkolo_db -c "\dt"
curl -s http://localhost:5000/health
```

## Drill log

| Date | Operator | Result |
| :--- | :--- | :--- |
| 2026-09-11 | Agent (O0.4) | Plain `pg_dump` to `backups/` exercised against local Compose Postgres |

Update this table when you re-run a drill.
