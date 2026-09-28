import { rankHandInfo } from "./game.js";
import { rulesDescription } from "./rules.js";
import usePractice from "./usePractice.js";
import DecisionPanel from "./components/DecisionPanel.jsx";
import Card from "./components/Card.jsx";
import StrategyReference from "./components/StrategyReference.jsx";

const handTypeOptions = [
  ["hard", "Hard count"],
  ["soft", "Soft count"],
  ["pairs", "Pairs"],
];
const houseEdges = { s17: "0.28", h17: "0.47", freebet: "1.04" };

export default function App() {
  const { state, choose, deal, nextRef, firstActionRef, nextHand } =
    usePractice();
  const { hand, answer } = state;
  const info = rankHandInfo(hand.a.rank, hand.b.rank);
  const free = state.mode === "freebet";
  const percent = state.answeredCount
    ? Math.round((state.correctCount / state.answeredCount) * 100)
    : 0;
  function toggleFilter(type) {
    const filters = state.filters.includes(type)
      ? state.filters.filter((item) => item !== type)
      : [...state.filters, type];
    deal("filters", { filters });
  }
  return (
    <main>
      <header>
        <a className="brand" href="./">
          <span className="brand-icon">♠</span> BLACKJACK TRAINER
          <span className="brand-sub">/ BASIC STRATEGY</span>
        </a>
        <span className="practice">PRACTICE TABLE</span>
      </header>
      <section className="intro">
        <div>
          <p className="eyebrow">ONE HAND. ONE DECISION.</p>
          <h1>Make the right move.</h1>
          <p>Choose the best play against the dealer’s upcard.</p>
        </div>
      </section>
      <section className="mode-controls">
        <label htmlFor="rule-mode">Table rules</label>
        <select
          id="rule-mode"
          value={state.mode}
          onChange={(event) => deal("mode", { mode: event.target.value })}
        >
          <option value="s17">Standard S17</option>
          <option value="h17">Standard H17</option>
          <option value="freebet">Free Bet Blackjack (H17)</option>
        </select>
        <span id="mode-summary">Switching rules resets the count.</span>
      </section>
      <section className="focus-controls" aria-label="Practice hand types">
        <fieldset>
          <legend>Focus your practice</legend>
          <div className="focus-toggles">
            {handTypeOptions.map(([type, label]) => (
              <label key={type}>
                <input
                  type="checkbox"
                  role="switch"
                  value={type}
                  checked={state.filters.includes(type)}
                  onChange={() => toggleFilter(type)}
                  name="hand-type"
                />
                <span className="switch-track" aria-hidden="true"></span>
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      <section className="table" aria-label="Blackjack practice table">
        <div className="table-top">
          <span>INITIAL HAND</span>
          <div className="session-stats">
            <span id="hand-number">{`HAND ${String(state.handNumber).padStart(2, "0")}`}</span>
            <span
              id="accuracy"
              aria-live="polite"
              title={`${state.correctCount} correct out of ${state.answeredCount} answered hands`}
              aria-label={`${percent}% correct; ${state.correctCount} of ${state.answeredCount} answered hands`}
            >
              {percent}% CORRECT
            </span>
            <button
              id="reset-count"
              type="button"
              onClick={() => deal("reset")}
            >
              Reset Count
            </button>
          </div>
        </div>
        <div className="dealer">
          <h2>DEALER SHOWS</h2>
          <div id="dealer-card" className="cards">
            <Card card={hand.dealer} />
          </div>
        </div>
        <div className="table-divider">
          <div className="table-rules">
            <span>BLACKJACK PAYS 3 : 2</span>
            <span id="table-rule-label">
              {state.mode === "s17"
                ? "DEALER MUST STAND ON 17"
                : "DEALER MUST HIT ON SOFT 17"}
            </span>
          </div>
        </div>
        <div className="player">
          <h2>
            YOUR HAND{" "}
            <span id="total" className="total">
              {info.pair
                ? `Pair · ${info.total}`
                : `${info.soft ? "Soft" : "Hard"} ${info.total}`}
            </span>
          </h2>
          <div id="player-cards" className="cards">
            <Card card={hand.a} />
            <Card card={hand.b} />
          </div>
        </div>
      </section>
      <DecisionPanel
        state={state}
        choose={choose}
        nextHand={nextHand}
        nextRef={nextRef}
        firstActionRef={firstActionRef}
      />
      <footer>
        <details open>
          <summary>Table rules & strategy reference</summary>
          <p id="rules-description">{rulesDescription(state.mode)}</p>
          <p id="house-edge">{`The house edge under this strategy is ${houseEdges[state.mode]} %.`}</p>
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
          <StrategyReference mode={state.mode} />
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
    </main>
  );
}
