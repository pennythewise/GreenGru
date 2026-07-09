#!/usr/bin/env bash
set -euo pipefail

# Apply the SQL schema in `supabase/migrations/0001_init.sql` to the
# `DATABASE_URL` connection. This helper normalizes the common
# `postgresql+asyncpg://...` value to a plain `postgresql://...` URI so
# `psql` can consume it.

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sql_path="$script_dir/../../supabase/migrations/0001_init.sql"

if [ ! -f "$sql_path" ]; then
  echo "Cannot find SQL file: $sql_path" >&2
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Set the DATABASE_URL environment variable before running this script." >&2
  echo "Example: export DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db" >&2
  exit 1
fi

# Remove the +asyncpg transport label if present so psql accepts the URI.
psql_url="${DATABASE_URL//+asyncpg/}"

echo "Applying schema from $sql_path to $psql_url"

# Use psql. Ensure psql is installed (Postgres client).
psql "$psql_url" -f "$sql_path"

echo "Schema applied."
