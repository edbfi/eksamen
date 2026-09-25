# Development CI

Every PR and default-branch push runs the existing `prek` quality hooks and static
HTML smoke checks through `ci.yml`. The original workflows remain callable and
manually runnable, so their useful checks are preserved without duplicate PR runs.
The shared `ci / required` gate requires both lanes to succeed and blocks missing,
failed, cancelled, or unexpectedly skipped prerequisites.

Local quality checks remain:

```sh
SKIP=no-commit-to-branch prek run --all-files --hook-stage manual
```

CI pins prek 0.5.3. Hooks may fix local files; CI treats any required fixer changes
as a failure. Vendored Ministry exam material keeps its existing hook exclusions
and remains unmodified. The smoke check serves `docs/` on localhost and asserts
that both landing pages return real HTML. It does not test client-side rendering
or decrypt the exam index. No Node toolchain, bundler, or placeholder test suite
is added to this static site.

Shared actions and presets use immutable `v4.0.0` references. Renovate is the sole
dependency merger: the shared `automerge.json` preset arms GitHub auto-merge with
rebase merges, which preserve signed commits, and GitHub merges only once every
required check passes on the current head. Current branches, applicable release
ages, reviews and hold labels remain required. Shared automation configuration
updates remain manual. The custom Actions merger and its comment commands are
retired.

The separate PR policy workflow checks Conventional Commit titles, genuine
matching author sign-offs, Renovate provenance, holds, review requests and
unresolved changes requests. After a pass, it re-runs the other event's older
failed verdict for the same head, which needs `actions: write`. Require its actual
emitted policy context alongside the application checks, from GitHub Actions,
with strict up-to-date branch protection. Preserve stronger native review
requirements. An explicit `ci.yml` dispatch does not substitute for a missing PR
policy check. Review exact head/base, full diffs, DCO, all required CI and
artifacts before a bootstrap merge; verify resulting default-branch CI afterwards.

The shared smoke action now owns startup, readiness, deadlines and process
cleanup. `.github/scripts/smoke.sh` retains the two first-party HTML assertions.
The smoke workflow remains callable and independently dispatchable. This remains
HTTP/content coverage; it does not execute client-side JavaScript.

Pages continues to publish the static `main:/docs` tree at `eksamen.edb.fi`.
Current Renovate extraction manages only workflow, hook and shared-preset versions,
all outside `docs/`; those updates do not change the served tree. Normal maintainer
and Renovate App merges retain native Pages publication. If served dependencies
or a build are introduced, require their runtime checks and inspect publication
before continuing the merge queue. No Node toolchain or Biome is introduced.
