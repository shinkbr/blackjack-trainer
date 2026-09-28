import usePractice from "./usePractice.js";
import DecisionPanel from "./components/DecisionPanel.jsx";
import PracticeControls from "./components/PracticeControls.jsx";
import PracticeTable from "./components/PracticeTable.jsx";
import PracticeFooter from "./components/PracticeFooter.jsx";

export default function App() {
  const {
    state,
    choose,
    changeMode,
    toggleFilter,
    resetCount,
    nextRef,
    firstActionRef,
    nextHand,
  } = usePractice();

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
      <PracticeControls
        mode={state.mode}
        filters={state.filters}
        onModeChange={changeMode}
        onToggleFilter={toggleFilter}
      />
      <PracticeTable state={state} onReset={resetCount} />
      <DecisionPanel
        state={state}
        choose={choose}
        nextHand={nextHand}
        nextRef={nextRef}
        firstActionRef={firstActionRef}
      />
      <PracticeFooter mode={state.mode} />
    </main>
  );
}
