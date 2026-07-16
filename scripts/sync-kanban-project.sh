#!/usr/bin/env bash
# Sync kanban catalog → GitHub Project #2
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/sync-kanban-project.mjs "$@"
