# Contributing to ChanchiNutri

Thanks for your interest in contributing.

## Ground rules

- Keep changes focused and easy to review.
- Do not commit secrets or credentials.
- Avoid dead code and unused imports.
- If behavior changes, update or add tests.

## Development setup

```bash
npm install
npm start
```

## Quality checks (required before PR)

```bash
npm run quality
```

This runs:

- Jest tests
- Type checking (`tsc --noEmit`)
- Build verification (`npm run build:verify`)

## Pull request checklist

- [ ] Scope is clear and minimal.
- [ ] Tests were added or updated when needed.
- [ ] `npm run quality` passes locally.
- [ ] No secrets were added.
- [ ] README/docs were updated if user-facing behavior changed.

## Commit style

Use short, imperative commit messages. Examples:

- `fix: prevent blank screen on back navigation`
- `docs: clarify release APK artifacts`

## Reporting bugs

Please use the issue templates and include:

- Steps to reproduce
- Expected result
- Actual result
- Device and OS details
