#!/usr/bin/env bash
#
# Sync the "current stable release" line of every addon page with the real
# latest GitHub release.
#
# The English pages carry "**Current stable release:** `vX.Y.Z` (YYYY-MM-DD)" and
# the Spanish ones "**Release estable actual:** ...". Both drifted for months
# because they were only ever updated by hand, so this runs on a schedule and
# opens a PR when reality has moved on.
#
# Requires: gh (authenticated), sed. Run from the repository root.

set -euo pipefail

ORG="slice-soft"
DOCS_DIR="src/content/docs"

ADDONS=(gorm mongo jwt oauth redis devpanel otel)

# Label used by each locale for the version line.
label_for() {
    case "$1" in
        en) printf '**Current stable release:**' ;;
        es) printf '**Release estable actual:**' ;;
        *) return 1 ;;
    esac
}

changed=0
missing=0

for addon in "${ADDONS[@]}"; do
    repo="ss-keel-${addon}"

    if ! release=$(gh api "repos/${ORG}/${repo}/releases/latest" 2>/dev/null); then
        echo "WARN  ${repo}: could not read the latest release — left untouched" >&2
        missing=$((missing + 1))
        continue
    fi

    version=$(printf '%s' "$release" | jq -r '.tag_name // empty')
    date=$(printf '%s' "$release" | jq -r '.published_at // empty' | cut -c1-10)

    if [[ -z "$version" || -z "$date" ]]; then
        echo "WARN  ${repo}: release has no tag or date — left untouched" >&2
        missing=$((missing + 1))
        continue
    fi

    for locale in en es; do
        page="${DOCS_DIR}/${locale}/addons/${repo}.md"
        [[ -f "$page" ]] || { echo "WARN  ${page} does not exist" >&2; continue; }

        label=$(label_for "$locale")
        want="${label} \`${version}\` (${date})"

        if grep -qF "$want" "$page"; then
            continue
        fi

        if ! grep -q "^${label}" "$page"; then
            echo "WARN  ${page} has no version line — add one to keep it in sync" >&2
            missing=$((missing + 1))
            continue
        fi

        # Rewrite the whole line: the version, the date, or both may have moved.
        python3 - "$page" "$label" "$want" <<'PY'
import re, sys
path, label, want = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path) as fh:
    content = fh.read()
pattern = "^" + re.escape(label) + r".*$"
content = re.sub(pattern, want.replace("\\", "\\\\"), content, count=1, flags=re.M)
with open(path, "w") as fh:
    fh.write(content)
PY
        echo "SYNC  ${page} -> ${version} (${date})"
        changed=$((changed + 1))
    done
done

echo
echo "${changed} page(s) updated, ${missing} skipped."

# A page that could not be read or has no version line is a real gap, but it
# must not block the PR carrying the pages that did sync.
exit 0
