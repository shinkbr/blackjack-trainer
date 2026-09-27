const actions = ["Hit", "Stand", "Double", "Split", "Surrender"];
let currentMode = "s17";
const suits = ["♠", "♥", "♦", "♣"];
let hand,
  answered = false,
  handNumber = 0,
  answeredCount = 0,
  correctCount = 0;
const $ = (id) => document.getElementById(id);
const random = (n) => Math.floor(Math.random() * n);
function value(rank) {
  return rank === "A" ? 11 : ["J", "Q", "K"].includes(rank) ? 10 : Number(rank);
}
function randomCard() {
  const rank = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ][random(13)];
  return { rank, suit: suits[random(4)], value: value(rank) };
}
function cardHTML(card) {
  const names = { "♠": "spades", "♥": "hearts", "♦": "diamonds", "♣": "clubs" };
  return `<div class="card ${["♥", "♦"].includes(card.suit) ? "red" : ""}" role="img" aria-label="${card.rank} of ${names[card.suit]}"><span class="corner" aria-hidden="true">${card.rank}<small>${card.suit}</small></span><span class="pip" aria-hidden="true">${card.suit}</span><span class="corner bottom" aria-hidden="true">${card.rank}<small>${card.suit}</small></span></div>`;
}
const handTypes = ["hard", "soft", "pairs"];
function selectedTypes() {
  const selected = [
    ...document.querySelectorAll('[name="hand-type"]:checked'),
  ].map((input) => input.value);
  return selected.length ? selected : handTypes;
}
function rankHandInfo(a, b) {
  return { ...handInfo(value(a), value(b)), pair: a === b };
}
function category(a, b) {
  const info = rankHandInfo(a, b);
  return info.pair ? "pairs" : info.soft ? "soft" : "hard";
}
const handPools = { hard: [], soft: [], pairs: [] };
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
for (const a of ranks)
  for (const b of ranks) {
    if (handInfo(value(a), value(b)).total !== 21)
      handPools[category(a, b)].push([a, b]);
  }
function drawHand(types) {
  const type = types[random(types.length)];
  const pool = handPools[type];
  const [a, b] = pool[random(pool.length)];
  return {
    a: { rank: a, value: value(a), suit: suits[random(4)] },
    b: { rank: b, value: value(b), suit: suits[random(4)] },
    dealer: randomCard(),
  };
}
function deal() {
  hand = drawHand(selectedTypes());
  answered = false;
  handNumber++;
  render();
  return readHand();
}
function updateScore() {
  const percent = answeredCount
    ? Math.round((correctCount / answeredCount) * 100)
    : 0;
  $("accuracy").textContent = `${percent}% CORRECT`;
  $("accuracy").title =
    `${correctCount} correct out of ${answeredCount} answered hands`;
  $("accuracy").setAttribute(
    "aria-label",
    `${percent}% correct; ${correctCount} of ${answeredCount} answered hands`,
  );
}
function resetCount() {
  handNumber = 0;
  answeredCount = 0;
  correctCount = 0;
  return deal();
}
function readHand() {
  return {
    player: [hand.a.rank, hand.b.rank],
    dealer: hand.dealer.rank,
    category: category(hand.a.rank, hand.b.rank),
    enabledTypes: selectedTypes(),
    mode: currentMode,
    answeredCount,
    correctCount,
    ...rankHandInfo(hand.a.rank, hand.b.rank),
    answered,
  };
}
function render() {
  updateScore();
  const info = rankHandInfo(hand.a.rank, hand.b.rank);
  $("dealer-card").innerHTML = cardHTML(hand.dealer);
  $("player-cards").innerHTML = cardHTML(hand.a) + cardHTML(hand.b);
  $("total").textContent = info.pair
    ? `Pair · ${info.total}`
    : `${info.soft ? "Soft" : "Hard"} ${info.total}`;
  $("hand-number").textContent = `HAND ${String(handNumber).padStart(2, "0")}`;
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.className = "";
    btn.disabled =
      (btn.dataset.action === "Split" && !info.pair) ||
      (btn.dataset.action === "Surrender" && currentMode === "freebet");
  });
  updateActionLabels(info);
  $("feedback").className = "feedback";
  $("result").textContent = "Your next good decision starts here.";
  $("explanation").textContent =
    "Choose an action to check your basic strategy.";
  $("next").hidden = true;
}
function choose(action) {
  if (!actions.includes(action)) throw new Error("Unknown action.");
  if (answered) throw new Error("Deal the next hand before answering again.");
  const info = rankHandInfo(hand.a.rank, hand.b.rank);
  if (action === "Split" && !info.pair)
    throw new Error("Only cards of the same rank can be split.");
  if (action === "Surrender" && currentMode === "freebet")
    throw new Error("Surrender is unavailable in Free Bet mode.");
  const correct = strategy(
    hand.a.value,
    hand.b.value,
    hand.dealer.value,
    currentMode,
    info.pair,
  );
  answered = true;
  const isCorrect = action === correct;
  answeredCount++;
  if (isCorrect) correctCount++;
  updateScore();
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.action === correct) btn.classList.add("right");
    else if (btn.dataset.action === action) btn.classList.add("wrong");
  });
  $("feedback").className = "feedback " + (isCorrect ? "success" : "error");
  $("result").textContent = isCorrect
    ? "Correct!"
    : `Not quite. The correct action is ${correct.toLowerCase()}.`;
  const label =
    correct === "Split"
      ? `Pair of ${hand.a.rank}s`
      : `${info.soft ? "Soft" : "Hard"} ${info.total}`;
  $("explanation").textContent =
    `${label} against dealer ${hand.dealer.rank}: ${correct.toLowerCase()}. ${correct === "Surrender" ? "Late surrender gives up half your bet." : correct === "Double" ? (isFreeDouble(info) ? "The house funds the extra bet; receive exactly one more card." : "Add your own matching bet and receive exactly one more card.") : correct === "Split" ? (isFreeSplit(info) ? "The house funds the second hand." : "Separate the pair into two hands.") : correct === "Hit" ? "Take another card." : "Keep your current total."}`;
  $("next").hidden = false;
  $("next").focus({ preventScroll: true });
  return { chosen: action, correctAction: correct, isCorrect };
}
function isFreeDouble(info) {
  return (
    currentMode === "freebet" &&
    !info.soft &&
    info.total >= 9 &&
    info.total <= 11
  );
}
function isFreeSplit(info) {
  return currentMode === "freebet" && info.pair && hand.a.value !== 10;
}
function updateActionLabels(info) {
  $("double-label").textContent = isFreeDouble(info) ? "Free double" : "Double";
  $("double-hint").textContent = isFreeDouble(info)
    ? "House funds extra bet"
    : currentMode === "freebet"
      ? "Use your own bet"
      : "Double & take one";
  $("split-label").textContent = isFreeSplit(info) ? "Free split" : "Split";
  $("split-hint").textContent = isFreeSplit(info)
    ? "House funds new hand"
    : info.pair
      ? "Make two hands"
      : "Pairs only";
  $("surrender-hint").textContent =
    currentMode === "freebet" ? "Not available" : "Give up half";
}
function changeMode(mode) {
  if (!ruleModes[mode]) throw new Error("Unknown rule mode.");
  currentMode = mode;
  $("rule-mode").value = mode;
  updateModeView();
  return resetCount();
}
$("rule-mode").addEventListener("change", (event) =>
  changeMode(event.target.value),
);
$("reset-count").addEventListener("click", resetCount);
document
  .querySelectorAll('[name="hand-type"]')
  .forEach((input) => input.addEventListener("change", () => deal()));
document
  .querySelectorAll("[data-action]")
  .forEach((btn) =>
    btn.addEventListener("click", () => choose(btn.dataset.action)),
  );
$("next").addEventListener("click", () => {
  deal();
  document.querySelector("[data-action]").focus({ preventScroll: true });
});
document.addEventListener("keydown", (e) => {
  if (
    e.repeat ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
  )
    return;
  if (!answered && /^[1-5]$/.test(e.key)) {
    const btn = document.querySelector(
      `[data-action="${actions[Number(e.key) - 1]}"]`,
    );
    if (!btn.disabled) {
      e.preventDefault();
      btn.click();
    }
  }
});
updateModeView();
deal();
if (document.modelContext?.registerTool) {
  for (const tool of [
    {
      name: "read_practice_hand",
      description: "Read the current blackjack practice hand.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => readHand(),
    },
    {
      name: "answer_practice_hand",
      description: "Submit a blackjack action and show strategy feedback.",
      inputSchema: {
        type: "object",
        properties: { action: { type: "string", enum: actions } },
        required: ["action"],
        additionalProperties: false,
      },
      execute: (input) => choose(input.action),
    },
    {
      name: "deal_practice_hand",
      description: "Start a new randomized practice hand.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: () => deal(),
    },
  ]) {
    try {
      Promise.resolve(document.modelContext.registerTool(tool)).catch(() => {});
    } catch {}
  }
}
function updateModeView() {
  $("house-edge").textContent =
    `The house edge under this strategy is ${{ s17: "0.28", h17: "0.47", freebet: "1.04" }[currentMode]} %.`;
  const free = currentMode === "freebet",
    h17 = currentMode === "h17",
    mode = ruleModes[currentMode];
  $("rule-chip").textContent = `6 decks · Dealer ${mode.dealer}`;
  $("mode-summary").textContent = free
    ? "Free doubles & splits · Dealer 22 pushes · No surrender"
    : `Dealer ${mode.dealer} · Late surrender`;
  $("table-rule-label").textContent = free
    ? "FREE DOUBLES: HARD 9–11 ◆ FREE SPLITS: EXCEPT TENS ◆ PUSH 22"
    : "DOUBLE AFTER SPLIT ALLOWED ◆ LATE SURRENDER";
  $("rules-description").textContent = free
    ? "6 decks. Dealer hits soft 17 (H17). Free doubles on two-card hard 9, 10 or 11; other doubles use your own money. Free splits on matching-rank pairs except ten-value cards. A pair of fives is best free-doubled. Double after split allowed; re-split up to four hands, including aces. No surrender. Dealer 22 pushes surviving non-blackjack hands; a player bust still loses, and a natural blackjack pays 3:2. Dealer checks for blackjack before play. This mode practices the initial real-money hand."
    : `6 decks. Dealer ${mode.dealer} (${h17 ? "H17" : "S17"}). Double on any first two cards; double after split allowed. Late surrender on the initial two cards after the dealer checks for blackjack. Assume that check is complete. Only cards of the same rank may be split. Blackjack pays 3:2.`;
  $("strategy-source").innerHTML =
    `Reference: <a href="https://wizardofodds.com/games/${free ? "free-bet-blackjack/" : "blackjack/strategy/4-decks/"}" target="_blank" rel="noopener noreferrer">Wizard of Odds — ${free ? "Free Bet Blackjack" : "4–8 deck basic strategy"} ↗</a>. Switching modes resets the count.`;
  const tables = strategyTables(currentMode),
    head = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"]
      .map((d) => `<th scope="col">${d}</th>`)
      .join("");
  let html = `<p class="strategy-order"><strong>${mode.name}</strong> · ${free ? "Initial real-money hand. Check pairs, then hard or soft count." : "Check surrender, then pairs, then hard or soft count."} Columns show the dealer’s upcard.</p><p class="strategy-legend"><span class="move-H">H · Hit</span><span class="move-S">S · Stand</span><span class="move-D">D · ${free ? "Paid double" : "Double"}</span><span class="move-P">${free ? "FP · Free split" : "P · Split"}</span>${free ? '<span class="move-D">FD · Free double</span>' : '<span class="move-R">R · Surrender</span>'}</p>`;
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
      h17
        ? "Hard totals only. Surrender 88 against A; split 88 against every other dealer card."
        : "Hard totals only. Exclude 88 from 16: split instead.",
    ],
  ];
  for (const [key, title, note] of sections) {
    html += `<section class="strategy-block" aria-labelledby="chart-${key}"><h3 id="chart-${key}">${title}</h3>`;
    if (free && key === "surrender") {
      html += "<p>Surrender is not available in Free Bet mode.</p></section>";
      continue;
    }
    html += `<div class="strategy-scroll" tabindex="0" role="region" aria-label="${title} strategy table"><table class="strategy-grid"><caption class="visually-hidden">${title} against dealer upcard</caption><thead><tr><th scope="col">Your hand</th>${head}</tr></thead><tbody>`;
    for (const [label, codes] of tables[key]) {
      html += `<tr><th scope="row">${label}</th>`;
      for (const code of codes) {
        const fd = free && code === "D" && (key === "hard" || key === "pairs"),
          fp = free && code === "P";
        const shown = fd ? "FD" : fp ? "FP" : code === "-" ? "—" : code;
        const name = fd
          ? "Free double"
          : fp
            ? "Free split"
            : code === "-"
              ? "Use hard or soft table"
              : free && code === "D"
                ? "Paid double"
                : actionNames[code];
        html += `<td class="move-${code === "-" ? "none" : code}"><abbr title="${name}">${shown}</abbr></td>`;
      }
      html += "</tr>";
    }
    html += `</tbody></table></div><p class="omitted">${note}</p></section>`;
  }
  $("strategy-reference").innerHTML = html;
}
