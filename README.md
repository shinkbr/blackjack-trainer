# Blackjack Trainer

A React practice table for initial-hand blackjack basic strategy, with S17, H17, and Free Bet modes, category filters, session accuracy, and strategy charts.

## Development

Requires Node.js and pnpm; see `package.json` for supported versions.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. Press 1–5 to answer, then use Next hand to continue. Changing rules resets the count; changing filters preserves it. With no filters selected, all categories are included.

## Checks and production build

```sh
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm preview
```

Deploy `dist/` to a static host. Relative asset URLs support subdirectories. Use Vite to serve the source; do not open `index.html` directly.

## GitHub Pages

In **Settings → Pages → Build and deployment**, select **GitHub Actions**. The workflow checks lint, formatting, and tests before building and deploying pushes to `main`. It also supports manual runs on `main`.

The deployed site is available at <https://shinkbr.github.io/blackjack-trainer/> after the first successful deployment.

## Code

- `src/App.jsx` and `src/components/`: declarative interface and strategy charts.
- `src/usePractice.js`: React session state, practice commands, and focus management.
- `src/usePracticeKeyboard.js`: keyboard shortcuts and listener cleanup.
- `src/modelContext.js`: optional browser Model Context tool registration and cleanup.
- `src/cards.js`: shared card ranks, suits, and values.
- `src/game.js`: card generation and session transitions.
- `src/strategy.js`: rule tables and strategy decisions.
- `src/rules.js`: table-rule descriptions for each mode.
- `tests/`: strategy, session, interaction, and browser-tool regression checks.

Licensed under the [MIT license](LICENSE).
