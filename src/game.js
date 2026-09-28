import { createCard, ranks, rankValue, suits } from "./cards.js";
import { handInfo, strategy, ruleModes } from "./strategy.js";
export const actions = ["Hit", "Stand", "Double", "Split", "Surrender"];
export const handTypes = ["hard", "soft", "pairs"];
function pickRandom(items, random) {
  return items[Math.floor(random() * items.length)];
}

export function rankHandInfo(a, b) {
  return { ...handInfo(rankValue(a), rankValue(b)), pair: a === b };
}

export function category(a, b) {
  const info = rankHandInfo(a, b);
  if (info.pair) return "pairs";
  return info.soft ? "soft" : "hard";
}

function createHandPools() {
  const pools = { hard: [], soft: [], pairs: [] };
  for (const a of ranks) {
    for (const b of ranks) {
      if (rankHandInfo(a, b).total !== 21) {
        pools[category(a, b)].push([a, b]);
      }
    }
  }
  return pools;
}

const handPools = createHandPools();

export function drawHand(types = handTypes, random = Math.random) {
  const enabledTypes = types.length ? types : handTypes;
  const type = pickRandom(enabledTypes, random);
  const [a, b] = pickRandom(handPools[type], random);
  return {
    a: createCard(a, pickRandom(suits, random)),
    b: createCard(b, pickRandom(suits, random)),
    dealer: createCard(pickRandom(ranks, random), pickRandom(suits, random)),
  };
}

// Keep action availability consistent across buttons, shortcuts, and tools.
export function actionUnavailableReason(action, { pair, mode }) {
  if (!actions.includes(action)) return "Unknown action.";
  if (action === "Split" && !pair) {
    return "Only cards of the same rank can be split.";
  }
  if (action === "Surrender" && mode === "freebet") {
    return "Surrender is unavailable in Free Bet mode.";
  }
  return null;
}

export function createSession(mode = "s17", filters = []) {
  return {
    mode,
    filters,
    hand: drawHand(filters),
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
      if (!Object.hasOwn(ruleModes, event.mode))
        throw new Error("Unknown rule mode.");
      return {
        ...sessionReducer(state, { type: "reset", hand: event.hand }),
        mode: event.mode,
      };
    case "filters":
      return {
        ...sessionReducer(state, { type: "deal", hand: event.hand }),
        filters: event.filters,
      };
    case "answer":
      return answerHand(state, event.action);
    default:
      throw new Error("Unknown session event.");
  }
}

function answerHand(state, action) {
  const { hand, mode } = state;
  const info = rankHandInfo(hand.a.rank, hand.b.rank);
  const unavailableReason = actionUnavailableReason(action, {
    ...info,
    mode,
  });
  if (unavailableReason) throw new Error(unavailableReason);
  if (state.answer)
    throw new Error("Deal the next hand before answering again.");
  const correctAction = strategy(
    hand.a.value,
    hand.b.value,
    hand.dealer.value,
    mode,
    info.pair,
  );
  const isCorrect = action === correctAction;
  return {
    ...state,
    answer: { chosen: action, correctAction, isCorrect },
    answeredCount: state.answeredCount + 1,
    correctCount: state.correctCount + Number(isCorrect),
  };
}
