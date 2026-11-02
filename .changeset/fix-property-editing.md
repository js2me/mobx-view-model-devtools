---
"mobx-view-model-devtools": patch
---

Fix observable and computed property editing in the devtools UI:

- Include non-enumerable own getters in the property tree so computed properties on observable objects can be inspected and edited.
- Escape strings correctly when opening the editor, including quotes, backslashes and newlines.
- Read properties with empty names correctly and allow editing Map entries whose key is undefined.
- Apply array length edits inside computed snapshots and report invalid lengths without discarding the input.
- Give Set rows stable identities so repeated edits target the same value without deleting and re-adding unrelated members. Native Set insertion order is preserved.
- Edit the nearest computed snapshot while preserving shared observable objects, arrays and service instances exposed by other computed getters.
- Keep Map and Set snapshots intact when editing entries or nested values, and expose nested collections in the property tree.
- Preserve sparse array entries and support editing additional array properties inside computed snapshots.
- Use native observable writes and target only the nearest observable owner for edits inside plain ref/shallow data, avoiding global VM refreshes and payload lifecycle calls.
- Keep computed overrides on their original atom and isolate MobX internals in one adapter so normal MobX scheduling and equality checks handle dependent updates.

Add 71 UI regression tests covering editing controls, cancellation, validation, nested values, dependent computed graphs, computed overrides, reaction consistency and observer updates.
