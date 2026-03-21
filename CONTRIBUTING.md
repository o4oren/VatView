# Contributing to VatView

Thanks for your interest in contributing! VatView is a community VATSIM app maintained by one person. Contributions are welcome — here's how to make the process smooth for both of us.

---

## What Contributions Are Most Welcome

- **Bug fixes** — especially platform-specific issues on devices or regions I can't easily test
- **Aircraft type mappings** — adding new type codes to the icon service (`app/common/aircraftIconService.js`)
- **ATC facility corrections** — callsign prefix mappings, facility type fixes
- **Translations** — if/when i18n is added
- **Documentation improvements**

Feature requests are welcome as GitHub Issues, but large new features may not be accepted unless they align with the project direction.

---

## Getting Started

1. Fork the repository
2. Follow the setup instructions in the [README](./README.md) — you'll need your own Firebase project and Google Maps API key
3. Create a branch for your change:

```bash
git checkout -b fix/describe-your-fix
# or
git checkout -b feat/describe-your-feature
```

---

## Before You Submit a PR

- Run `npm run lint` and fix any warnings
- Test on at least one platform (iOS or Android)
- Keep changes focused — one fix or feature per PR
- Don't reformat unrelated code or add unsolicited refactors
- Don't add TypeScript — the project uses plain JSX/JS

---

## Commit Style

Follow the existing convention:

```
fix(component): short description
feat(component): short description
chore: short description
docs: short description
```

---

## Filing Issues

**Bug reports** — include:
- Platform (iOS / Android) and OS version
- App version
- Steps to reproduce
- What you expected vs. what happened

**Feature requests** — describe the use case, not just the feature. Why would VATSIM users benefit?

---

## Code Style

- JavaScript (JSX) — no TypeScript
- ESLint config is in `.eslintrc.json` — run `npm run lint` before committing
- Follow existing patterns in the file you're editing
- Use `useCallback` and `React.memo` where appropriate for map components (performance matters)
- Comments should explain *why*, not *what*

---

## License

By submitting a contribution, you agree it will be licensed under the [VatView Source License](./LICENSE). You retain authorship credit but the copyright owner may include your contribution in any release.
