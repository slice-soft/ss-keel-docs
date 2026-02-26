<img src="assets/boat.svg" width="400" />

# Keel

Keel is a Go framework for building REST APIs with modular 
architecture, automatic OpenAPI, and built-in validation.

[![CI](https://github.com/slice-soft/ss-keel-core/actions/workflows/ci.yml/badge.svg)](https://github.com/slice-soft/ss-keel-core/actions)
![Go](https://img.shields.io/badge/Go-1.25+-00ADD8?logo=go&logoColor=white)
[![Go Report Card](https://goreportcard.com/badge/github.com/slice-soft/ss-keel-core)](https://goreportcard.com/report/github.com/slice-soft/ss-keel-core)
[![Go Reference](https://pkg.go.dev/badge/github.com/slice-soft/ss-keel-core.svg)](https://pkg.go.dev/github.com/slice-soft/ss-keel-core)
![License](https://img.shields.io/badge/License-MIT-green)
![Made in Colombia](https://img.shields.io/badge/Made%20in-Colombia-FCD116?labelColor=003893)

**Live site:** [docs.keel-go.dev](https://docs.keel-go.dev)
**Framework repo:** [slice-soft/ss-keel-core](https://github.com/slice-soft/ss-keel-core)

## Content structure

```
src/content/docs/
├── guides/          # Step-by-step guides (getting started, controllers, modules…)
├── cli/             # CLI reference
├── addons/          # Official addon documentation (ss-keel-gorm, ss-keel-jwt…)
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

To add or edit content, find the relevant file under `src/content/docs/` and edit it directly. New pages are picked up automatically by filename — update the sidebar in `astro.config.mjs` if you add a new section or page.

For changes to the framework itself, see the [core repo](https://github.com/slice-soft/ss-keel-core).
