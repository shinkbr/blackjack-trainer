import { actions, actionUnavailableReason, rankHandInfo } from "../game.js";

export default function DecisionPanel({
  state,
  choose,
  nextHand,
  nextRef,
  firstActionRef,
}) {
  const { hand, answer } = state;
  const info = rankHandInfo(hand.a.rank, hand.b.rank);
  const free = state.mode === "freebet";
  const freeDouble = free && !info.soft && info.total >= 9 && info.total <= 11;
  const freeSplit = free && info.pair && hand.a.value !== 10;
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
  let explanation = "Choose an action to check your basic strategy.";
  if (answer) {
    const correct = answer.correctAction;
    const label =
      correct === "Split"
        ? `Pair of ${hand.a.rank}s`
        : `${info.soft ? "Soft" : "Hard"} ${info.total}`;
    const details = {
      Surrender: "Late surrender gives up half your bet.",
      Double: freeDouble
        ? "The house funds the extra bet; receive exactly one more card."
        : "Add your own matching bet and receive exactly one more card.",
      Split: freeSplit
        ? "The house funds the second hand."
        : "Separate the pair into two hands.",
      Hit: "Take another card.",
      Stand: "Keep your current total.",
    };
    explanation = `${label} against dealer ${hand.dealer.rank}: ${correct.toLowerCase()}. ${details[correct]}`;
  }
  return (
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
              Boolean(
                actionUnavailableReason(action, { ...info, mode: state.mode }),
              )
            }
            className={actionFeedbackClass(action, answer)}
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
  );
}

function actionFeedbackClass(action, answer) {
  if (!answer) return "";
  if (action === answer.correctAction) return "right";
  return action === answer.chosen ? "wrong" : "";
}
