export function makeHand(a = "10", b = "6", dealer = "10") {
  function card(rank) {
    const value =
      rank === "A" ? 11 : ["J", "Q", "K"].includes(rank) ? 10 : Number(rank);
    return { rank, value, suit: "♠" };
  }
  return { a: card(a), b: card(b), dealer: card(dealer) };
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
