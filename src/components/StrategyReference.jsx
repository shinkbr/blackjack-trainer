import { actionNames, ruleModes, strategyTables } from "../strategy.js";
const upcards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];
export default function StrategyReference({ mode }) {
  const free = mode === "freebet";
  const tables = strategyTables(mode);
  const sections = [
    [
      "hard",
      "Hard count",
      "Check pairs and surrender before using these actions.",
    ],
    [
      "soft",
      "Soft count",
      "A = ace counted as 11. For example, A7 is soft 18.",
    ],
    [
      "pairs",
      "Pair splitting",
      "TT means 10,10; J,J; Q,Q; or K,K. Mixed ranks are hard 20. A dash means use the hard or soft table.",
    ],
    [
      "surrender",
      "Surrender",
      mode === "h17"
        ? "Hard totals only. Surrender 88 against A; split 88 against every other dealer card."
        : "Hard totals only. Exclude 88 from 16: split instead.",
    ],
  ];
  return (
    <section
      className="strategy-reference"
      id="strategy-reference"
      aria-label="Basic strategy tables"
    >
      <p className="strategy-order">
        <strong>{ruleModes[mode].name}</strong> ·{" "}
        {free
          ? "Initial real-money hand. Check pairs, then hard or soft count."
          : "Check surrender, then pairs, then hard or soft count."}{" "}
        Columns show the dealer’s upcard.
      </p>
      <p className="strategy-legend">
        <span className="move-H">H · Hit</span>
        <span className="move-S">S · Stand</span>
        <span className="move-D">D · {free ? "Paid double" : "Double"}</span>
        <span className="move-P">{free ? "FP · Free split" : "P · Split"}</span>
        {free ? (
          <span className="move-D">FD · Free double</span>
        ) : (
          <span className="move-R">R · Surrender</span>
        )}
      </p>
      {sections.map(([key, title, note]) => (
        <section
          key={key}
          className="strategy-block"
          aria-labelledby={`chart-${key}`}
        >
          <h3 id={`chart-${key}`}>{title}</h3>
          {free && key === "surrender" ? (
            <p>Surrender is not available in Free Bet mode.</p>
          ) : (
            <>
              <div
                className="strategy-scroll"
                tabIndex={0}
                role="region"
                aria-label={`${title} strategy table`}
              >
                <table className="strategy-grid">
                  <caption className="visually-hidden">
                    {title} against dealer upcard
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Your hand</th>
                      {upcards.map((card) => (
                        <th key={card} scope="col">
                          {card}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tables[key].map(([label, codes]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        {[...codes].map((code, i) => {
                          const fd =
                            free &&
                            code === "D" &&
                            (key === "hard" || key === "pairs");
                          const fp = free && code === "P";
                          const shown = fd
                            ? "FD"
                            : fp
                              ? "FP"
                              : code === "-"
                                ? "—"
                                : code;
                          const name = fd
                            ? "Free double"
                            : fp
                              ? "Free split"
                              : code === "-"
                                ? "Use hard or soft table"
                                : free && code === "D"
                                  ? "Paid double"
                                  : actionNames[code];
                          return (
                            <td
                              key={i}
                              className={`move-${code === "-" ? "none" : code}`}
                            >
                              <abbr title={name}>{shown}</abbr>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="omitted">{note}</p>
            </>
          )}
        </section>
      ))}
    </section>
  );
}
