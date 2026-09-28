import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import usePractice from "../src/usePractice.js";

import { drawHand } from "../src/game.js";
import { makeHand, makeSession } from "./fixtures.js";

vi.mock("../src/game.js", async (importOriginal) => ({
  ...(await importOriginal()),
  drawHand: vi.fn(),
  createSession: () => makeSession(),
}));

beforeEach(() => {
  vi.mocked(drawHand).mockReturnValue(makeHand());
});

afterEach(() => {
  delete document.modelContext;
});

it("keeps browser tools current across consecutive calls and cleans up on unmount", () => {
  const tools = new Map();
  document.modelContext = {
    registerTool: vi.fn((tool) => tools.set(tool.name, tool)),
    unregisterTool: vi.fn((name) => tools.delete(name)),
  };
  const view = renderHook(usePractice, { wrapper: StrictMode });
  expect([...tools.keys()]).toEqual([
    "read_practice_hand",
    "answer_practice_hand",
    "deal_practice_hand",
  ]);
  const read = () => tools.get("read_practice_hand").execute();
  const answer = () =>
    tools.get("answer_practice_hand").execute({ action: "Hit" });
  expect(read().answered).toBe(false);
  act(() => {
    answer();
    expect(read().answeredCount).toBe(1);
    expect(answer).toThrow("Deal the next hand before answering again.");
    tools.get("deal_practice_hand").execute();
    expect(read().answered).toBe(false);
    answer();
    expect(read().answeredCount).toBe(2);
  });
  expect(view.result.current.state.answeredCount).toBe(2);
  view.unmount();
  expect(tools.size).toBe(0);
});

it("uses the latest filters for consecutive commands before a render", () => {
  const { result } = renderHook(usePractice);

  act(() => {
    result.current.toggleFilter("hard");
    result.current.toggleFilter("pairs");
    result.current.toggleFilter("hard");
    result.current.changeMode("h17");
  });

  expect(drawHand.mock.calls).toEqual([
    [["hard"]],
    [["hard", "pairs"]],
    [["pairs"]],
    [["pairs"]],
  ]);
  expect(result.current.state).toMatchObject({
    filters: ["pairs"],
    mode: "h17",
    handNumber: 1,
  });
});

it("preserves filters and rules when resetting an answered session", () => {
  const { result } = renderHook(usePractice);

  act(() => {
    result.current.toggleFilter("hard");
    result.current.changeMode("h17");
    result.current.choose("Hit");
    result.current.resetCount();
  });

  expect(result.current.state).toMatchObject({
    filters: ["hard"],
    mode: "h17",
    handNumber: 1,
    answeredCount: 0,
    correctCount: 0,
    answer: null,
  });
});

it("removes keyboard shortcuts on unmount", () => {
  const { result, unmount } = renderHook(usePractice);
  const state = result.current.state;
  unmount();

  const event = new KeyboardEvent("keydown", { key: "1", cancelable: true });
  document.dispatchEvent(event);

  expect(event.defaultPrevented).toBe(false);
  expect(result.current.state).toBe(state);
});
