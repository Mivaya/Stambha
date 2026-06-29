#!/usr/bin/env bash
# Sync docs/internal/kanban → GitHub Project #2
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/sync-kanban-project.mjs "$@"
