import { describe, expect, it } from "vitest";
import {
  actions,
  createSession,
  drawHand,
  rankHandInfo,
  sessionReducer,
} from "../src/game.js";
import { strategy } from "../src/strategy.js";

const card = (rank) => ({
  rank,
  value: rank === "A" ? 11 : ["J", "Q", "K"].includes(rank) ? 10 : Number(rank),
  suit: "♠",
});
const hand = (a, b, dealer) => ({
  a: card(a),
  b: card(b),
  dealer: card(dealer),
});
describe("practice session", () => {
  it("scores once, rejects duplicate answers, and preserves scores on a new hand", () => {
    let state = { ...createSession(), hand: hand("10", "6", "10") };
    state = sessionReducer(state, { type: "answer", action: "Surrender" });
    expect(state.correctCount).toBe(1);
    expect(state.answeredCount).toBe(1);
    expect(() =>
      sessionReducer(state, { type: "answer", action: "Hit" }),
    ).toThrow();
    state = sessionReducer(state, { type: "deal", hand: hand("A", "7", "6") });
    expect(state.answer).toBeNull();
    expect(state.handNumber).toBe(2);
    expect(state.correctCount).toBe(1);
    state = sessionReducer(state, {
      type: "mode",
      mode: "h17",
      hand: state.hand,
    });
    expect(state.handNumber).toBe(1);
    expect(state.answeredCount).toBe(0);
  });
  it("rejects unavailable actions and respects rank-based pairs", () => {
    const state = { ...createSession("freebet"), hand: hand("J", "Q", "6") };
    expect(rankHandInfo("J", "Q").pair).toBe(false);
    expect(() =>
      sessionReducer(state, { type: "answer", action: "Split" }),
    ).toThrow();
    expect(() =>
      sessionReducer(state, { type: "answer", action: "Surrender" }),
    ).toThrow();
  });
  it("draws only selected categories and skips naturals", () => {
    for (const type of ["hard", "soft", "pairs"]) {
      for (let i = 0; i < 100; i++) {
        const { a, b } = drawHand([type]);
        const info = rankHandInfo(a.rank, b.rank);
        expect(info.total).not.toBe(21);
        expect(info.pair ? "pairs" : info.soft ? "soft" : "hard").toBe(type);
      }
    }
  });
  it("preserves rule-specific strategy decisions", () => {
    expect(strategy(11, 7, 2, "s17")).toBe("Stand");
    expect(strategy(11, 7, 2, "h17")).toBe("Double");
    expect(strategy(5, 4, 11, "freebet")).toBe("Double");
    expect(strategy(8, 8, 11, "h17")).toBe("Surrender");
    expect(strategy(8, 8, 11, "s17")).toBe("Split");
    for (const mode of ["s17", "h17", "freebet"]) {
      for (let a = 2; a <= 11; a++)
        for (let b = 2; b <= 11; b++)
          for (let d = 2; d <= 11; d++) {
            if (a + b === 21) continue;
            expect(actions).toContain(strategy(a, b, d, mode));
          }
    }
  });
});
