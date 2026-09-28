import { createCard } from "../src/cards.js";

export function makeHand(a = "10", b = "6", dealer = "10") {
  return {
    a: createCard(a, "♠"),
    b: createCard(b, "♠"),
    dealer: createCard(dealer, "♠"),
  };
}

export function makeSession(overrides = {}) {
  return {
    mode: "s17",
    filters: [],
    hand: makeHand(),
    handNumber: 1,
    answeredCount: 0,
    correctCount: 0,
    answer: null,
    ...overrides,
  };
}
