import { actionNames, ruleModes, strategyTables } from "../strategy.js";
const upcards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];
export default function StrategyReference({ mode }) {
  const free = mode === "freebet";
  const tables = strategyTables(mode);
  const sections = [
    ["hard", "Hard count"],
    ["soft", "Soft count"],
    ["pairs", "Pair splitting"],
    ["surrender", "Surrender"],
  ];
  return (
    <section
      className="strategy-reference"
      id="strategy-reference"
      aria-label="Basic strategy tables"
    >
      <h2>{ruleModes[mode].name} Strategy</h2>
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
      {sections.map(([key, title]) => (
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
            </>
          )}
        </section>
      ))}
    </section>
  );
}
