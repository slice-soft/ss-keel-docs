#!/usr/bin/env node
// Keeps the "created by keel add <addon>" snippets in the addon pages identical
// to what the addon actually generates.
//
// The snippets were transcribed by hand and drifted: every page still showed a
// `log *logger.Logger` parameter the CLI stopped generating, and the OAuth page
// had a whole earlier version of the file — 71 lines away from reality. A reader
// copying from it configured providers the addon no longer wires.
//
// So the snippet is not edited here, it is replaced with the manifest's own
// content. Transcription is the thing that drifts, so nothing is transcribed.
//
// Usage:
//   node scripts/sync-addon-snippets.mjs            # fetch manifests from GitHub
//   node scripts/sync-addon-snippets.mjs --check    # exit 1 on drift, change nothing
//   ADDONS_DIR=../ node scripts/sync-addon-snippets.mjs   # read sibling checkouts

import fs from "node:fs";
import path from "node:path";

const DOCS = "src/content/docs";
const LOCALES = ["en", "es"];

// A setup function is shown in three shapes, and they are not interchangeable:
//   addons/ss-keel-<a>.md               the whole generated file, imports included
//   addons/ss-keel-<a>/configuration.md just the function, as an excerpt
//   cli/add.md                          just the function, as an example of a step
// Replacing an excerpt with the full file would paste an import block into the
// middle of a page explaining one function, so the shape is detected per block.
const pagesFor = (addon) => [
  `addons/ss-keel-${addon}.md`,
  `addons/ss-keel-${addon}/configuration.md`,
  "cli/add.md",
];
const ADDONS = ["gorm", "mongo", "redis", "jwt", "oauth", "otel", "devpanel"];
const ORG = "slice-soft";

const check = process.argv.includes("--check");
const localDir = process.env.ADDONS_DIR;

async function manifest(addon) {
  const repo = `ss-keel-${addon}`;
  if (localDir) {
    const p = path.join(localDir, repo, "keel-addon.json");
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
  }
  const url = `https://raw.githubusercontent.com/${ORG}/${repo}/main/keel-addon.json`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  aviso: no se pudo leer el manifiesto de ${repo} (${res.status}); se salta`);
    return null;
  }
  return res.json();
}

// The generated file lives in a create_provider_file step's content.
function generatedSetup(m) {
  for (const s of m.steps ?? []) {
    if (typeof s.content === "string" && /^func setup\w+\(/m.test(s.content)) {
      const fn = s.content.match(/func (setup\w+)\(/)[1];
      return { fn, body: s.content.trimEnd() };
    }
  }
  return null;
}

// Pull one top-level function out of a Go file by brace balance. A regex up to
// the first "\n}" would stop at the first closing brace in column 0 inside a
// composite literal, and setupOAuth has several.
function extractFunc(src, fn) {
  const start = src.search(new RegExp(`^func ${fn}\\(`, "m"));
  if (start === -1) return null;
  let depth = 0, seen = false;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") { depth++; seen = true; }
    else if (src[i] === "}") { depth--; if (seen && depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}

// Replace the fenced go block that defines `fn`. A block containing `package
// main` is the whole file and is replaced wholesale, keeping the leading path
// comment the docs put above it — that comment tells the reader which file this
// is and the manifest has no reason to carry it. Any other block is an excerpt,
// so only the function inside it is swapped and the surrounding prose example
// stays as the author wrote it.
function replaceBlock(md, fn, body) {
  const fence = /```go\n([\s\S]*?)```/g;
  let out = md, found = false, m;
  while ((m = fence.exec(md)) !== null) {
    if (!new RegExp(`func ${fn}\\(`).test(m[1])) continue;
    found = true;
    let next;
    if (/^package main\b/m.test(m[1])) {
      const header = m[1].match(/^(\/\/[^\n]*\n)+(?=package main\b)/);
      next = "```go\n" + (header ? header[0] : "") + body + "\n```";
    } else {
      const want = extractFunc(body, fn);
      const have = extractFunc(m[1], fn);
      if (!want || !have || want === have) continue;
      next = "```go\n" + m[1].replace(have, want) + "```";
    }
    out = out.replace(m[0], next);
  }
  return { out, found };
}

let drift = 0, missing = 0;

for (const addon of ADDONS) {
  const m = await manifest(addon);
  if (!m) { missing++; continue; }
  const gen = generatedSetup(m);
  if (!gen) continue;

  for (const loc of LOCALES) for (const page of pagesFor(addon)) {
    const file = path.join(DOCS, loc, page);
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, "utf8");
    const { out, found } = replaceBlock(before, gen.fn, gen.body);
    if (!found) continue;
    if (out === before) continue;
    drift++;
    const delta = out.split("\n").length - before.split("\n").length;
    console.log(`  ${check ? "DERIVA" : "corregido"}  ${file}  (${gen.fn}, ${delta >= 0 ? "+" : ""}${delta} líneas)`);
    if (!check) fs.writeFileSync(file, out);
  }
}

if (missing) console.warn(`\n${missing} manifiesto(s) ilegibles: sincronización parcial.`);
if (check && drift) {
  console.error(`\n${drift} fichero(s) muestran código que el addon ya no genera.`);
  process.exit(1);
}
console.log(drift ? `\n${drift} fichero(s) actualizados.` : "\nTodo al día.");
