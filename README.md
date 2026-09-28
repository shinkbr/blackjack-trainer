# Blackjack Trainer

A React 19.2.8 practice table for initial-hand blackjack basic strategy. Includes S17, H17, and Free Bet modes, category filters, keyboard shortcuts, session accuracy, and strategy reference charts.

## Development

Use Node.js 22.22.2+ or 24.15+ LTS and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. Press 1–5 to answer; use Next hand to continue. Changing table rules resets the session count. With no category filters selected, all categories are included.

## Checks and production build

```sh
pnpm test
pnpm format:check
pnpm build
pnpm preview
```

Deploy the generated `dist/` directory to a static host. Asset URLs are relative, supporting hosting under a subdirectory. The source `index.html` requires Vite; do not open it directly as a file.

## Code

- `src/App.jsx` and `src/components/`: declarative interface and strategy charts.
- `src/usePractice.js`: React session state, keyboard/focus behavior, and optional browser Model Context tools.
- `src/game.js`: card generation and session transitions.
- `src/strategy.js`: rule tables and strategy decisions.
- `tests/`: strategy, session, interaction, and browser-tool regression checks.

Licensed under the [MIT license](LICENSE).
