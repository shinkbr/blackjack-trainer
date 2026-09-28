/* Six-deck initial-hand strategy. Sources: Wizard of Odds 4–8 deck and Free Bet charts. */
function handInfo(a, b) {
  let total = a + b;
  let soft = a === 11 || b === 11;
  if (total > 21) {
    total -= 10;
    soft = a === 11 && b === 11;
  }
  return { total, soft, pair: a === b };
}
const ruleModes = {
  s17: { name: "Standard S17", dealer: "stands on soft 17" },
  h17: { name: "Standard H17", dealer: "hits soft 17" },
  freebet: { name: "Free Bet Blackjack", dealer: "hits soft 17" },
};
function strategyTables(mode = "s17") {
  if (!ruleModes[mode]) throw new Error("Unknown rule mode.");
  const h17 = mode === "h17",
    free = mode === "freebet";
  const hard = [
    ["17-20", "SSSSSSSSSS"],
    ["16", "SSSSSHHHHH"],
    ["15", "SSSSSHHHHH"],
    ["14", "SSSSSHHHHH"],
    ["13", free ? "HSSSSHHHHH" : "SSSSSHHHHH"],
    ["12", free ? "HHHSSHHHHH" : "HHSSSHHHHH"],
    ["11", h17 || free ? "DDDDDDDDDD" : "DDDDDDDDDH"],
    ["10", free ? "DDDDDDDDDD" : "DDDDDDDDHH"],
    ["9", free ? "DDDDDDDDDD" : "HDDDDHHHHH"],
    ["2-8", "HHHHHHHHHH"],
  ];
  const soft = [
    ["A9", "SSSSSSSSSS"],
    ["A8", h17 ? "SSSSDSSSSS" : "SSSSSSSSSS"],
    ["A7", free ? "SSSDDSSHHH" : h17 ? "DDDDDSSHHH" : "SDDDDSSHHH"],
    ["A6", free ? "HHHDDHHHHH" : "HDDDDHHHHH"],
    ["A5", free ? "HHHHDHHHHH" : "HHDDDHHHHH"],
    ["A4", free ? "HHHHHHHHHH" : "HHDDDHHHHH"],
    ["A3", free ? "HHHHHHHHHH" : "HHHDDHHHHH"],
    ["A2", free ? "HHHHHHHHHH" : "HHHDDHHHHH"],
  ];
  const pairs = [
    ["AA", "PPPPPPPPPP"],
    ["TT", "----------"],
    ["99", free ? "PPPPPPPPPP" : "PPPPP-PP--"],
    ["88", h17 ? "PPPPPPPPPR" : "PPPPPPPPPP"],
    ["77", free ? "PPPPPPPPPP" : "PPPPPP----"],
    ["66", free ? "PPPPPPPPPP" : "PPPPP-----"],
    ["55", free ? "DDDDDDDDDD" : "----------"],
    ["44", free ? "PPPPPPPPPP" : "---PP-----"],
    ["33", free ? "PPPPPPPPPP" : "PPPPPP----"],
    ["22", free ? "PPPPPPPPPP" : "PPPPPP----"],
  ];
  const surrender = free
    ? []
    : [
        ...(h17 ? [["17", "---------R"]] : []),
        ["16", "-------RRR"],
        ["15", h17 ? "--------RR" : "--------R-"],
      ];
  return { hard, soft, pairs, surrender };
}
const actionNames = {
  H: "Hit",
  S: "Stand",
  D: "Double",
  P: "Split",
  R: "Surrender",
};
function strategy(a, b, d, mode = "s17", pair = a === b) {
  const tables = strategyTables(mode),
    { total, soft } = handInfo(a, b),
    col = d - 2;
  if (!soft) {
    const row = tables.surrender.find((r) => Number(r[0]) === total);
    if (
      row &&
      row[1][col] === "R" &&
      !(pair && a === 8 && !(mode === "h17" && d === 11))
    )
      return "Surrender";
  }
  if (pair) {
    const key = a === 11 ? "AA" : a === 10 ? "TT" : `${a}${a}`;
    const code = tables.pairs.find((r) => r[0] === key)[1][col];
    if (code !== "-") return actionNames[code];
  }
  if (soft) {
    if (total >= 19)
      return mode === "h17" && total === 19 && d === 6 ? "Double" : "Stand";
    if (total === 12) return "Hit";
    return actionNames[
      tables.soft.find((r) => r[0] === `A${total - 11}`)[1][col]
    ];
  }
  const key = total >= 17 ? "17-20" : total <= 8 ? "2-8" : String(total);
  return actionNames[tables.hard.find((r) => r[0] === key)[1][col]];
}

export { handInfo, strategy, strategyTables, ruleModes, actionNames };
