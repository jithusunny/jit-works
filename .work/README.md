# Optional local work connection

The tracked `config.json` contains only public jit.works defaults. Tests and the website do not need
access to a GitHub Project.

The owner work commands (`npm run work -- brief`, `plan`, `capture`, `start`, `finish`, and `audit`)
need a local GitHub Project connection:

1. Copy `config.local.example.json` to `config.local.json`.
2. Replace every placeholder with values from a Project you can access.
3. Keep `config.local.json` on your machine. Git ignores it.

When the local file is absent, the work command stops with setup guidance instead of guessing or
using a hidden Project.
