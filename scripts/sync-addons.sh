#!/usr/bin/env bash
# Runs every addon sync in one pass, so the weekly job opens a single PR
# instead of two that touch the same pages and conflict with each other.
#
#   sync-addon-versions.sh   the stable-release line of each addon page
#   sync-addon-snippets.mjs  the "created by keel add <addon>" code blocks
#
# Neither is allowed to abort the other: a version that cannot be read should
# not throw away a snippet correction, and vice versa. Each reports its own
# failures and this exits non-zero only if one of them actually errored.
set -uo pipefail

cd "$(dirname "$0")/.."
status=0

echo "==> Versiones"
if ! ./scripts/sync-addon-versions.sh; then
    echo "    la sincronización de versiones falló" >&2
    status=1
fi

echo
echo "==> Fragmentos de código"
if ! node ./scripts/sync-addon-snippets.mjs; then
    echo "    la sincronización de fragmentos falló" >&2
    status=1
fi

exit "$status"
