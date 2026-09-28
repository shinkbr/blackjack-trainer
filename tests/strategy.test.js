// @vitest-environment node
import { describe, expect, it } from "vitest";
import { actions } from "../src/game.js";
import { strategy, strategyTables } from "../src/strategy.js";

describe("basic strategy", () => {
  it.each([
    [11, 7, 2, "s17", "Stand"],
    [11, 7, 2, "h17", "Double"],
    [5, 4, 11, "freebet", "Double"],
    [8, 8, 11, "h17", "Surrender"],
    [8, 8, 11, "s17", "Split"],
    [11, 11, 10, "freebet", "Split"],
    [10, 6, 10, "freebet", "Hit"],
  ])(
    "plays %i + %i against %i under %s as %s",
    (a, b, dealer, mode, expected) => {
      expect(strategy(a, b, dealer, mode)).toBe(expected);
    },
  );

  it.each(["s17", "h17", "freebet"])(
    "returns a valid action for every initial hand in %s",
    (mode) => {
      for (let a = 2; a <= 11; a++) {
        for (let b = 2; b <= 11; b++) {
          for (let dealer = 2; dealer <= 11; dealer++) {
            if (a + b === 21) continue;
            expect(actions).toContain(strategy(a, b, dealer, mode));
          }
        }
      }
    },
  );

  it.each(["invalid", "toString"])("rejects unknown mode %s", (mode) => {
    expect(() => strategyTables(mode)).toThrow("Unknown rule mode.");
  });
});
