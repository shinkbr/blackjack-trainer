import { rankHandInfo } from "../game.js";
import Card from "./Card.jsx";

export default function PracticeTable({ state, onReset }) {
  const { hand } = state;
  const info = rankHandInfo(hand.a.rank, hand.b.rank);
  const percent = state.answeredCount
    ? Math.round((state.correctCount / state.answeredCount) * 100)
    : 0;
  return (
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
          <button id="reset-count" type="button" onClick={() => onReset()}>
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
  );
}
