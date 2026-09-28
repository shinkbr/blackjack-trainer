const handTypeOptions = [
  ["hard", "Hard count"],
  ["soft", "Soft count"],
  ["pairs", "Pairs"],
];

export default function PracticeControls({
  mode,
  filters,
  onModeChange,
  onToggleFilter,
}) {
  return (
    <>
      <section className="mode-controls">
        <label htmlFor="rule-mode">Table rules</label>
        <select
          id="rule-mode"
          value={mode}
          onChange={(event) => onModeChange(event.target.value)}
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
                  checked={filters.includes(type)}
                  onChange={() => onToggleFilter(type)}
                  name="hand-type"
                />
                <span className="switch-track" aria-hidden="true"></span>
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
    </>
  );
}
