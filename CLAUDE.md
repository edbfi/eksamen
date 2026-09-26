# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Zero-build static site. `docs/` is the GitHub Pages root, served at the domain root (`docs/CNAME`). There is no `package.json`, bundler, or test suite: first-party code is plain ES modules and CSS loaded directly by the browser. Don't add a Node toolchain or formatter; `CI.md` and the workflow headers record that decision.

## Commands

```bash
# Serve locally. --directory docs is required: pages use root-absolute paths.
python3 -m http.server 4321 --bind 127.0.0.1 --directory docs

# Smoke check (what CI runs), against the server above
bash .github/scripts/smoke.sh

# Full quality gate, same as .github/workflows/code-quality.yml (fixers may rewrite files)
SKIP=no-commit-to-branch prek run --all-files --hook-stage manual

# One hook
prek run check-json --all-files
```

There are no unit tests. The smoke check only asserts that `/index.html` and `/optagelsesprover.html` return HTML; it runs no JavaScript, so verify rendering changes in a browser. Hooks aren't installed by default (`prek install`).

## Ownership

| Path | Owner | Rule |
| --- | --- | --- |
| `docs/index.html`, `docs/optagelsesprover.html`, `docs/css/`, `docs/js/`, `docs/img/`, `docs/fonts/` | First-party | Edit freely |
| `docs/proever/shared/` | First-party | Start gate and exam-page stylesheet. Extend here instead of copying per exam |
| `docs/proever/**/index.html` containing `class="doc-page"` | First-party | Hand-written link pages for PDF-only exams |
| Everything else under `docs/proever/` | Ministry, vendored | Copy verbatim. Never reformat, rename, re-encode, or tidy |

`prek.toml` excludes `^docs/proever/` from the whitespace, EOF, and line-ending fixers, so first-party files under that prefix are never auto-tidied either. Match the surrounding formatting by hand.

## Licensing

- `docs/proever/` content belongs to Børne- og Undervisningsministeriet (`docs/proever/LICENSE`: no modification or redistribution). Read that file before touching anything there.
- Site code is AGPLv3. Every first-party `.js` starts with `// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-3.0` and ends with `// @license-end` (LibreJS markers). Keep both, and add both to new scripts.

## How exams get listed

- `docs/js/landing.js` renders one card per entry of the `subjects` array in `docs/js/examList.js`, filled from `docs/proever/exam-index.json`. It iterates `subjects`, not the JSON keys. A key missing from `subjects` never renders, and a subject with no JSON entries shows "Ingen prøver endnu".
- `docs/js/optagelsesprover.js` is a separate implementation for the encrypted list and shares no code with `landing.js`.
- Every exam link goes to `proever/shared/exam-start.html?exam=<path>`, which redirects to `"../" + path`. That makes every `path` relative to `docs/proever/`, not `docs/`.

| Question | → `docs/proever/exam-index.json` | → `docs/proever/optagelsesprover.enc.json` |
| --- | --- | --- |
| FP9/FP10 exam shown on `index.html`? | ✅ | |
| Gymnasium optagelsesprøve (code-protected page)? | | ✅ |
| Editable by hand? | ✅ | ❌ AES-GCM ciphertext |

## Adding an FP9/FP10 exam

1. Create `docs/proever/FP9_<subject>/YYYY-MM-DD_<Descriptor>/`. Existing folders use `Title_Case_With_Underscores` with æ/ø/å written as `ae`/`oe`/`aa` (e.g. `2025-12-01_Laesning_Retskrivning`). Files inside use lowercase with hyphens.
2. PDF-only exam: add an `index.html` link page copied from `docs/proever/FP9_dansk/2025-12-01_Laesning_Retskrivning/index.html`. Link shared assets root-absolute (`/css/shared.css`, `/proever/shared/exam-page.css`) and the exam's own files relatively. Interactive Ministry HTML exam: no link page; point `path` at the vendored `index.html`.
3. Add the entry to `docs/proever/exam-index.json` under the subject key. The index is maintained by hand; a folder alone renders nothing.
   ```json
   {
     "name": "Læsning & Retskrivning",
     "date": "2025-12-01",
     "path": "FP9_dansk/2025-12-01_Laesning_Retskrivning/index.html"
   }
   ```
4. New subject: also append it to `subjects` in `docs/js/examList.js`, spelled exactly like the JSON key.
5. Update the hardcoded `Opdateret <date>` subtitle in `docs/index.html`.

## Adding an optagelsesprøve

The list exists only as ciphertext in `docs/proever/optagelsesprover.enc.json`: AES-GCM with a PBKDF2-SHA256 key derived from a code, holding an array of `{name, date, path}` (see `decryptIndex` in `docs/js/optagelsesprover.js`). The repo has neither the code nor an encryption script. Adding an entry means re-encrypting the whole array, so ask the maintainer for the code and tool rather than rebuilding the parameters yourself. Also update the hardcoded `6 prøver` in the `cross-link__meta` span of `docs/index.html`.

## Gotchas

- First-party pages assume a deploy at the domain root: `/css/shared.css`, `/favicon.svg`, and the `href="/"` back-links are root-absolute. If you serve the repo root or a subpath, every exam page loses its styling and links. Always serve with `--directory docs`.
- `check-added-large-files --maxkb=500` only checks newly added files, so it trips on most exam imports (91 tracked files already exceed 500 KB). Skip that hook for the import commit (`SKIP=check-added-large-files`) or raise `--maxkb` in `prek.toml` on purpose. Don't shrink Ministry files to make them fit.
- `no-commit-to-branch` blocks local commits on `main`. Work on a branch and open a PR.
- Project conventions require a Conventional Commit title and a `Signed-off-by` that matches the author, so commit with `git commit -s`.
- Design tokens (`--accent`, `--ink`, `--sp-*`, `--font-*`, `--max-w`) are declared only in `docs/css/shared.css`, which `landing.css` imports. Add new tokens there; don't redeclare colours or spacing.
- The first-party JS builds DOM with `createElement`/`textContent`; there's no `innerHTML` in it.
- The root `favicon.svg` isn't served; the live copy is `docs/favicon.svg`.
- `.github/workflows/pullfrog.yml` is generated: edit it only where it says so.

## Reference

- `README.md` states the naming intent for exam folders. Parts of it are out of date: there is no `FP9_engelsk/` folder, matematik lives at `2025-12-01_Matematik/med-hjaelpemidler/` rather than `_Med_Hjaelpemidler`, and link pages use root-absolute paths for shared assets. Where it disagrees with the tree, follow the tree.
