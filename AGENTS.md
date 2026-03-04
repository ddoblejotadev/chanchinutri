# ChanchiNutri Code Review Rules

## All Files

REJECT if:
- Secrets or credentials are committed.
- Errors are silently ignored.
- Dead code or unused imports remain.

## TypeScript and React Native

REJECT if:
- `any` is introduced without explicit justification.
- Public functions/components miss clear typings.
- Navigation changes can produce blank screens or orphan routes.

REQUIRE:
- Back-navigation behavior is covered by regression tests when navigation is modified.
- Source-level regression tests for route declarations and navigate targets are acceptable when runtime navigation harnesses are not present.
- Zustand state mutations remain immutable and predictable.

## Testing and Quality

REQUIRE:
- Relevant Jest tests are updated for behavior changes.
- `tsc --noEmit` passes.
- `npm run build:verify` passes for release-related changes.

## Release Safety

REJECT if:
- A release is created without meaningful commits since the previous tag.
- APK artifacts are missing for user-facing release tags.

## Review Response Format

FIRST LINE must be exactly one of:
- STATUS: PASSED
- STATUS: FAILED
