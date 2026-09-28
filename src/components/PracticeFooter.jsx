import { rulesDescription } from "../rules.js";
import StrategyReference from "./StrategyReference.jsx";

const houseEdges = { s17: "0.28", h17: "0.47", freebet: "1.04" };

export default function PracticeFooter({ mode }) {
  const free = mode === "freebet";
  return (
    <footer>
      <details open>
        <summary>Table rules & strategy reference</summary>
        <p id="rules-description">{rulesDescription(mode)}</p>
        <StrategyReference mode={mode} />
        <p>Never take insurance or "even money".</p>
        <p id="house-edge">{`The house edge under this strategy is ${houseEdges[mode]} %.`}</p>
        <p id="strategy-source">
          Reference:{" "}
          <a
            href={`https://wizardofodds.com/games/${free ? "free-bet-blackjack/" : "blackjack/strategy/4-decks/"}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Wizard of Odds —{" "}
            {free ? "Free Bet Blackjack" : "4–8 deck basic strategy"} ↗
          </a>
          .
        </p>
      </details>
      <a
        className="footer-link"
        href="https://github.com/shinkbr/blackjack-trainer"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </footer>
  );
}
