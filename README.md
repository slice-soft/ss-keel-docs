<img src="https://cdn.slicesoft.dev/boat.svg" width="400" />

# Keel

Keel is a Go framework for building REST APIs with modular 
architecture, automatic OpenAPI, and built-in validation.

[![CI](https://github.com/slice-soft/ss-keel-core/actions/workflows/ci.yml/badge.svg)](https://github.com/slice-soft/ss-keel-core/actions)
![Go](https://img.shields.io/badge/Go-1.25+-00ADD8?logo=go&logoColor=white)
[![Go Report Card](https://goreportcard.com/badge/github.com/slice-soft/ss-keel-core)](https://goreportcard.com/report/github.com/slice-soft/ss-keel-core)
[![Go Reference](https://pkg.go.dev/badge/github.com/slice-soft/ss-keel-core.svg)](https://pkg.go.dev/github.com/slice-soft/ss-keel-core)
![License](https://img.shields.io/badge/License-MIT-green)
![Made in Colombia](https://img.shields.io/badge/Made%20in-Colombia-FCD116?labelColor=003893)
[![Sponsor](https://img.shields.io/badge/Sponsor-SS--Keel-003893?logo=github-sponsors&logoColor=green)](https://github.com/sponsors/slice-soft)

**Live site:** [docs.keel-go.dev](https://docs.keel-go.dev)
**Framework repo:** [slice-soft/ss-keel-core](https://github.com/slice-soft/ss-keel-core)
**Tracks:** `ss-keel-core` `v0.11.0` plus split documentation for live addons

## Content structure

```
src/content/docs/
├── guides/          # Step-by-step guides (getting started, controllers, modules…)
├── cli/             # CLI reference
├── addons/          # Addon hub pages plus split sections (overview, installation…)
└── reference/       # API reference (App, Route, Ctx, errors…)
```

All pages are `.md` or `.mdx` files. Each file maps directly to a URL route.

## Local development

```bash
npm install
npm run dev       # http://localhost:4321
```

```bash
npm run build     # Production build → ./dist/
npm run preview   # Preview the built site locally
```

## Contributing

Content lives in `src/content/docs/` — addon home pages live at `addons/ss-keel-*.md`, and deeper addon guides live in sibling folders such as `addons/ss-keel-jwt/overview.md`. Update `astro.config.mjs` whenever you add or move navigable pages.

The base workflow, commit conventions, and community standards live in [ss-community](https://github.com/slice-soft/ss-community/blob/main/CONTRIBUTING.md).
For changes to the framework itself, open a PR in the [core repo](https://github.com/slice-soft/ss-keel-core).

## Community

| Document | |
|---|---|
| [CONTRIBUTING.md](https://github.com/slice-soft/ss-community/blob/main/CONTRIBUTING.md) | Workflow, commit conventions, and PR guidelines |
| [GOVERNANCE.md](https://github.com/slice-soft/ss-community/blob/main/GOVERNANCE.md) | Decision-making, roles, and release process |
| [CODE_OF_CONDUCT.md](https://github.com/slice-soft/ss-community/blob/main/CODE_OF_CONDUCT.md) | Community standards |
| [VERSIONING.md](https://github.com/slice-soft/ss-community/blob/main/VERSIONING.md) | SemVer policy and breaking changes |
| [SECURITY.md](https://github.com/slice-soft/ss-community/blob/main/SECURITY.md) | How to report vulnerabilities |
| [MAINTAINERS.md](https://github.com/slice-soft/ss-community/blob/main/MAINTAINERS.md) | Active maintainers |
