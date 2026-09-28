// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  createSession,
  drawHand,
  rankHandInfo,
  readHand,
  sessionReducer,
} from "../src/game.js";
import { makeHand, makeSession } from "./fixtures.js";

describe("practice session", () => {
  it.each([
    ["Surrender", true, 1],
    ["Hit", false, 0],
  ])("scores a %s answer", (action, isCorrect, correctCount) => {
    const state = makeSession();
    const next = sessionReducer(state, { type: "answer", action });
    expect(next).toMatchObject({
      answer: { chosen: action, correctAction: "Surrender", isCorrect },
      answeredCount: 1,
      correctCount,
    });
    expect(state).toEqual(makeSession());
  });

  it("rejects duplicate answers", () => {
    const state = sessionReducer(makeSession(), {
      type: "answer",
      action: "Hit",
    });
    expect(() =>
      sessionReducer(state, { type: "answer", action: "Hit" }),
    ).toThrow("Deal the next hand before answering again.");
  });

  it("preserves scores when dealing another hand", () => {
    const state = sessionReducer(makeSession(), {
      type: "answer",
      action: "Surrender",
    });
    const hand = makeHand("A", "7", "6");
    expect(sessionReducer(state, { type: "deal", hand })).toMatchObject({
      hand,
      answer: null,
      handNumber: 2,
      correctCount: 1,
      answeredCount: 1,
    });
  });

  it.each(["reset", "mode"])(
    "clears scores on %s and preserves filters",
    (type) => {
      const state = makeSession({
        filters: ["pairs"],
        handNumber: 5,
        answeredCount: 4,
        correctCount: 3,
      });
      expect(
        sessionReducer(state, { type, mode: "h17", hand: makeHand() }),
      ).toMatchObject({
        handNumber: 1,
        answeredCount: 0,
        correctCount: 0,
        answer: null,
        filters: ["pairs"],
        mode: type === "mode" ? "h17" : "s17",
      });
    },
  );

  it("changes filters without clearing scores", () => {
    const state = makeSession({ answeredCount: 2, correctCount: 1 });
    expect(
      sessionReducer(state, {
        type: "filters",
        filters: ["soft"],
        hand: makeHand("A", "7", "6"),
      }),
    ).toMatchObject({
      filters: ["soft"],
      handNumber: 2,
      answeredCount: 2,
      correctCount: 1,
    });
  });

  it.each([
    ["Split", "Only cards of the same rank can be split."],
    ["Surrender", "Surrender is unavailable in Free Bet mode."],
    ["invalid", "Unknown action."],
  ])("rejects unavailable action %s", (action, message) => {
    const state = makeSession({
      mode: "freebet",
      hand: makeHand("J", "Q", "6"),
    });
    expect(() => sessionReducer(state, { type: "answer", action })).toThrow(
      message,
    );
  });

  it("distinguishes matching ranks from matching values", () => {
    expect(rankHandInfo("J", "Q")).toEqual({
      total: 20,
      soft: false,
      pair: false,
    });
    expect(rankHandInfo("J", "J").pair).toBe(true);
    expect(rankHandInfo("A", "A")).toEqual({
      total: 12,
      soft: true,
      pair: true,
    });
  });

  it("exposes the current hand and enabled categories", () => {
    expect(readHand(makeSession())).toMatchObject({
      player: ["10", "6"],
      dealer: "10",
      category: "hard",
      enabledTypes: ["hard", "soft", "pairs"],
      answered: false,
    });
    expect(readHand(makeSession({ filters: ["hard"] })).enabledTypes).toEqual([
      "hard",
    ]);
  });

  it.each(["invalid", "toString"])("rejects unknown mode %s", (mode) => {
    expect(() =>
      sessionReducer(makeSession(), { type: "mode", mode, hand: makeHand() }),
    ).toThrow("Unknown rule mode.");
  });

  it("rejects unknown events", () => {
    expect(() => sessionReducer(makeSession(), { type: "invalid" })).toThrow(
      "Unknown session event.",
    );
  });
});

describe("hand generation", () => {
  it.each(["hard", "soft", "pairs"])(
    "draws only %s hands and excludes naturals",
    (type) => {
      // A two-card pool has at most 13² entries; these samples visit every slot.
      for (let index = 0; index < 169; index++) {
        const { a, b } = drawHand([type], () => index / 169);
        const info = rankHandInfo(a.rank, b.rank);
        expect(info.total).not.toBe(21);
        if (type === "pairs") expect(a.rank).toBe(b.rank);
        else {
          expect(a.rank).not.toBe(b.rank);
          expect(info.soft).toBe(type === "soft");
        }
      }
    },
  );

  it("treats empty filters as all categories", () => {
    expect(drawHand([], () => 0)).toEqual(drawHand(undefined, () => 0));
  });

  it("creates a fresh session with the requested rules and filters", () => {
    const state = createSession("h17", ["pairs"]);
    expect(state).toMatchObject({
      mode: "h17",
      filters: ["pairs"],
      handNumber: 1,
      answeredCount: 0,
      correctCount: 0,
      answer: null,
    });
    expect(state.hand.a.rank).toBe(state.hand.b.rank);
  });
});
