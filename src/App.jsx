import { actions, rankHandInfo } from "./game.js";
import { ruleModes } from "./strategy.js";
import { rulesDescription } from "./rules.js";
import usePractice from "./usePractice.js";
import Card from "./components/Card.jsx";
import StrategyReference from "./components/StrategyReference.jsx";

export default function App() {
  const { state, choose, deal, nextRef, firstActionRef, nextHand } =
    usePractice();
  const { hand, answer } = state;
  const info = rankHandInfo(hand.a.rank, hand.b.rank);
  const mode = ruleModes[state.mode];
  const free = state.mode === "freebet";
  const freeDouble = free && !info.soft && info.total >= 9 && info.total <= 11;
  const freeSplit = free && info.pair && hand.a.value !== 10;
  const percent = state.answeredCount
    ? Math.round((state.correctCount / state.answeredCount) * 100)
    : 0;
  const hints = {
    Hit: "Take a card",
    Stand: "Keep your hand",
    Double: freeDouble
      ? "House funds extra bet"
      : free
        ? "Use your own bet"
        : "Double & take one",
    Split: freeSplit
      ? "House funds new hand"
      : info.pair
        ? "Make two hands"
        : "Pairs only",
    Surrender: free ? "Not available" : "Give up half",
  };
  function toggleFilter(type) {
    const filters = state.filters.includes(type)
      ? state.filters.filter((item) => item !== type)
      : [...state.filters, type];
    deal("filters", { filters });
  }
  let explanation = "Choose an action to check your basic strategy.";
  if (answer) {
    const correct = answer.correctAction;
    const label =
      correct === "Split"
        ? `Pair of ${hand.a.rank}s`
        : `${info.soft ? "Soft" : "Hard"} ${info.total}`;
    const detail =
      correct === "Surrender"
        ? "Late surrender gives up half your bet."
        : correct === "Double"
          ? freeDouble
            ? "The house funds the extra bet; receive exactly one more card."
            : "Add your own matching bet and receive exactly one more card."
          : correct === "Split"
            ? freeSplit
              ? "The house funds the second hand."
              : "Separate the pair into two hands."
            : correct === "Hit"
              ? "Take another card."
              : "Keep your current total.";
    explanation = `${label} against dealer ${hand.dealer.rank}: ${correct.toLowerCase()}. ${detail}`;
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
        <div
          className="rule-chip"
          id="rule-chip"
        >{`6 decks · Dealer ${mode.dealer}`}</div>
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
        <span id="mode-summary">Switching modes resets the count.</span>
      </section>
      <section className="focus-controls" aria-label="Practice hand types">
        <fieldset>
          <legend>Focus your practice</legend>
          <div className="focus-toggles">
            <label>
              <input
                type="checkbox"
                role="switch"
                value="hard"
                checked={state.filters.includes("hard")}
                onChange={() => toggleFilter("hard")}
                name="hand-type"
              />
              <span className="switch-track" aria-hidden="true"></span>Hard
              count
            </label>
            <label>
              <input
                type="checkbox"
                role="switch"
                value="soft"
                checked={state.filters.includes("soft")}
                onChange={() => toggleFilter("soft")}
                name="hand-type"
              />
              <span className="switch-track" aria-hidden="true"></span>Soft
              count
            </label>
            <label>
              <input
                type="checkbox"
                role="switch"
                value="pairs"
                checked={state.filters.includes("pairs")}
                onChange={() => toggleFilter("pairs")}
                name="hand-type"
              />
              <span className="switch-track" aria-hidden="true"></span>Pairs
            </label>
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
          <span>BLACKJACK PAYS 3 : 2</span>
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
        <div className="table-bottom" id="table-rule-label">
          {free
            ? "FREE DOUBLES: HARD 9–11 ◆ FREE SPLITS: EXCEPT TENS ◆ PUSH 22"
            : "DOUBLE AFTER SPLIT ALLOWED ◆ LATE SURRENDER"}
        </div>
      </section>
      <section className="decision" aria-label="Choose your action">
        <div className="decision-heading">
          <h2>What’s your move?</h2>
          <span className="keyboard-hint">Use keys 1–5 to choose</span>
        </div>
        <div className="actions">
          {actions.map((action, index) => (
            <button
              key={action}
              data-action={action}
              ref={index === 0 ? firstActionRef : undefined}
              onClick={() => choose(action)}
              disabled={
                Boolean(answer) ||
                (action === "Split" && !info.pair) ||
                (action === "Surrender" && free)
              }
              className={
                answer
                  ? action === answer.correctAction
                    ? "right"
                    : action === answer.chosen
                      ? "wrong"
                      : ""
                  : ""
              }
            >
              <kbd>{index + 1}</kbd>
              <strong>
                {action === "Double" && freeDouble
                  ? "Free double"
                  : action === "Split" && freeSplit
                    ? "Free split"
                    : action}
              </strong>
              <small>{hints[action]}</small>
            </button>
          ))}
        </div>
        <div
          className={`feedback ${answer ? (answer.isCorrect ? "success" : "error") : ""}`}
          id="feedback"
          role="status"
          aria-live="polite"
        >
          <div>
            <strong id="result">
              {answer
                ? answer.isCorrect
                  ? "Correct!"
                  : `Not quite. The correct action is ${answer.correctAction.toLowerCase()}.`
                : "Your next good decision starts here."}
            </strong>
            <p id="explanation">{explanation}</p>
          </div>
          <button id="next" ref={nextRef} hidden={!answer} onClick={nextHand}>
            Next hand <span>→</span>
          </button>
        </div>
      </section>
      <footer>
        <details>
          <summary>Table rules & strategy reference</summary>
          <p id="rules-description">{rulesDescription(state.mode)}</p>
          <p id="house-edge">{`The house edge under this strategy is ${{ s17: "0.28", h17: "0.47", freebet: "1.04" }[state.mode]} %.`}</p>
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
        <span className="footer-mark">♠ &nbsp; PRACTICE, THEN REPEAT.</span>
      </footer>
    </main>
  );
}
