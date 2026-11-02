---
"mobx-view-model-devtools": patch
---

Fix observable and computed property editing in the devtools UI:

- Include non-enumerable own getters in the property tree so computed properties on observable objects can be inspected and edited.
- Escape strings correctly when opening the editor, including quotes, backslashes and newlines.
- Read properties with empty names correctly and allow editing Map entries whose key is undefined.
- Apply array length edits inside computed snapshots and report invalid lengths without discarding the input.
- Preserve Set entry order when editing values so repeated edits target the same row.
- Edit the nearest computed snapshot while preserving shared observable objects, arrays and service instances exposed by other computed getters.
- Keep Map and Set snapshots intact when editing entries or nested values, and expose nested collections in the property tree.
- Preserve sparse array entries and support editing additional array properties inside computed snapshots.

Add 54 UI regression tests covering editing controls, cancellation, validation, nested values, dependent computed graphs, computed overrides, reaction consistency and observer updates.
