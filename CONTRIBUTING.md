
# Contributing to ss-keel-docs

The base contributing guide — workflow, commit conventions, and community standards — lives in [ss-community](https://github.com/slice-soft/ss-community/blob/main/CONTRIBUTING.md). Read it first.

This document covers only what is specific to this repository.

---

## Setup

```bash
npm install
npm run dev   # http://localhost:4321
```

## Repository-specific rules

- All content lives in `src/content/docs/` as `.md` or `.mdx` files
- Each file maps directly to a URL route by filename
- When adding a new page, also register it in the sidebar inside `astro.config.mjs`
- For changes to the framework itself, open a PR in the [core repo](https://github.com/slice-soft/ss-keel-core)
- Code examples in docs should match the patterns used in `ss-keel-example-mngr`
