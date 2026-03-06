

## Plan: Remove all Lovable references

The project has Lovable references in two editable files:

1. **`README.md`** — Contains multiple mentions of Lovable (project name, URLs, instructions). Will be rewritten as a clean, generic project README for "Twice Talent - Execution Studio".

2. **`vite.config.ts`** — Imports and uses `lovable-tagger` (a dev plugin that adds `data-lov-*` attributes to HTML elements). Will remove the import and plugin usage entirely.

Note: `package.json` and `package-lock.json` list `lovable-tagger` as a dev dependency — removing it from `vite.config.ts` means it won't execute, but the package entry remains (it's a dev-only dependency not shipped to production). The lock files are auto-generated and shouldn't be manually edited.

### Changes

- **`vite.config.ts`**: Remove the `lovable-tagger` import and its usage in the plugins array.
- **`README.md`**: Replace entire content with a clean README for "Twice Talent" with no Lovable mentions.

