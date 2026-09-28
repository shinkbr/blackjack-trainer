// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { registerPracticeTools } from "../src/modelContext.js";

function setupContext(overrides = {}) {
  const context = {
    registerTool: vi.fn(),
    unregisterTool: vi.fn(),
    ...overrides,
  };
  const handlers = { read: vi.fn(), choose: vi.fn(), deal: vi.fn() };
  return { context, handlers };
}

describe("optional browser practice tools", () => {
  it.each([undefined, {}])("supports an unavailable API (%j)", (context) => {
    expect(registerPracticeTools(context, {})).toBeUndefined();
  });

  it("delegates tool calls and returns their results", () => {
    const { context, handlers } = setupContext();
    handlers.read.mockReturnValue({ answered: false });
    handlers.choose.mockReturnValue({ isCorrect: true });
    handlers.deal.mockReturnValue({ player: ["8", "8"] });
    const cleanup = registerPracticeTools(context, handlers);
    const [read, answer, deal] = context.registerTool.mock.calls.map(
      ([tool]) => tool,
    );

    expect(read.execute()).toEqual({ answered: false });
    expect(answer.execute({ action: "Split" })).toEqual({ isCorrect: true });
    expect(handlers.choose).toHaveBeenCalledExactlyOnceWith("Split");
    expect(deal.execute()).toEqual({ player: ["8", "8"] });

    cleanup();
    expect(context.unregisterTool.mock.calls).toEqual([
      ["read_practice_hand"],
      ["answer_practice_hand"],
      ["deal_practice_hand"],
    ]);
  });

  it.each(["throw", "reject"])(
    "isolates API failures that %s",
    async (failure) => {
      const fail = () => {
        if (failure === "throw") throw new Error("Unavailable");
        return Promise.reject(new Error("Unavailable"));
      };
      const { context, handlers } = setupContext({
        registerTool: vi.fn(fail),
        unregisterTool: vi.fn(fail),
      });

      const cleanup = registerPracticeTools(context, handlers);
      expect(context.registerTool).toHaveBeenCalledTimes(3);
      expect(cleanup).not.toThrow();
      await Promise.resolve();
      expect(context.unregisterTool).toHaveBeenCalledTimes(3);
    },
  );

  it("supports browsers without unregisterTool", () => {
    const { context, handlers } = setupContext({ unregisterTool: undefined });
    expect(registerPracticeTools(context, handlers)).not.toThrow();
  });
});
