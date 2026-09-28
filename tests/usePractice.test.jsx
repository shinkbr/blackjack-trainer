import { StrictMode } from "react";
import { expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import usePractice from "../src/usePractice.js";

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

it.each(["throw", "reject"])(
  "tolerates optional browser API failures that %s",
  async (failure) => {
    const fail = () => {
      if (failure === "throw") throw new Error("Unavailable");
      return Promise.reject(new Error("Unavailable"));
    };
    document.modelContext = {
      registerTool: vi.fn(fail),
      unregisterTool: vi.fn(fail),
    };
    const view = renderHook(usePractice);
    await act(async () => view.result.current.choose("Hit"));
    expect(view.result.current.state.answeredCount).toBe(1);
    view.unmount();
    await Promise.resolve();
    expect(document.modelContext.unregisterTool).toHaveBeenCalledTimes(3);
  },
);
