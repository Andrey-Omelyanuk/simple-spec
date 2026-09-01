# Architecture Templates

Ready-made architecture skeletons for `/architect`. Each template is a folder in
`src/templates/<name>/` with a set of `AGENTS.md` skeletons per level. `/architect`
reads the template folder, expands the levels for the domain and creates files
after consent.

The level format is one for all, in `src/LEVEL.md`; a template only defines the
typical levels of a particular architecture and what they are usually filled
with. There are no "ahead-of-time" levels in a template: each is either mandatory
for this architecture or marked "as needed".

## Template list

- `web-app/` — a monorepo: a Django backend monolith, an SPA client, infrastructure.
- `ts-lib/` — a reusable TypeScript library, one level.
- `python-lib/` — a reusable Python package (src-layout), one level.

To add a template — create a folder and mention it in the list above. No edits to
`install.sh` are needed: it copies `src/templates` as a whole.