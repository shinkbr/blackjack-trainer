import { handInfo, strategy, ruleModes } from "./strategy.js";
export const actions = ["Hit", "Stand", "Double", "Split", "Surrender"];
export const handTypes = ["hard", "soft", "pairs"];
const suits = ["♠", "♥", "♦", "♣"];
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

export function createSession(mode = "s17", filters = []) {
  return {
    mode,
    filters,
    hand: drawHand(filters.length ? filters : handTypes),
    handNumber: 1,
    answeredCount: 0,
    correctCount: 0,
    answer: null,
  };
}
export function readHand(state) {
  const { hand, mode, filters, answer, answeredCount, correctCount } = state;
  return {
    player: [hand.a.rank, hand.b.rank],
    dealer: hand.dealer.rank,
    category: category(hand.a.rank, hand.b.rank),
    enabledTypes: filters.length ? filters : handTypes,
    mode,
    answeredCount,
    correctCount,
    ...rankHandInfo(hand.a.rank, hand.b.rank),
    answered: Boolean(answer),
  };
}
export function sessionReducer(state, event) {
  switch (event.type) {
    case "deal":
      return {
        ...state,
        hand: event.hand,
        handNumber: state.handNumber + 1,
        answer: null,
      };
    case "reset":
      return {
        ...state,
        hand: event.hand,
        handNumber: 1,
        answeredCount: 0,
        correctCount: 0,
        answer: null,
      };
    case "mode":
      if (!ruleModes[event.mode]) throw new Error("Unknown rule mode.");
      return {
        ...sessionReducer(state, { type: "reset", hand: event.hand }),
        mode: event.mode,
      };
    case "filters":
      return {
        ...sessionReducer(state, { type: "deal", hand: event.hand }),
        filters: event.filters,
      };
    case "answer": {
      const { hand, mode } = state;
      const info = rankHandInfo(hand.a.rank, hand.b.rank);
      if (!actions.includes(event.action)) throw new Error("Unknown action.");
      if (state.answer)
        throw new Error("Deal the next hand before answering again.");
      if (event.action === "Split" && !info.pair)
        throw new Error("Only cards of the same rank can be split.");
      if (event.action === "Surrender" && mode === "freebet")
        throw new Error("Surrender is unavailable in Free Bet mode.");
      const correctAction = strategy(
        hand.a.value,
        hand.b.value,
        hand.dealer.value,
        mode,
        info.pair,
      );
      const isCorrect = event.action === correctAction;
      return {
        ...state,
        answer: { chosen: event.action, correctAction, isCorrect },
        answeredCount: state.answeredCount + 1,
        correctCount: state.correctCount + Number(isCorrect),
      };
    }
    default:
      throw new Error("Unknown session event.");
  }
}
export { drawHand, rankHandInfo, category };
