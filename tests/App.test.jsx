import { StrictMode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
afterEach(() => {
  cleanup();
  delete document.modelContext;
});
it("supports keyboard answers, focus, next hand, filters, and rule changes", async () => {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  await user.keyboard("1");
  const next = screen.getByRole("button", { name: /Next hand/ });
  expect(document.activeElement).toBe(next);
  expect(screen.getByRole("button", { name: /Hit/ }).disabled).toBe(true);
  await user.click(next);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: /Hit/ }),
  );
  expect(screen.getByText("HAND 02")).toBeTruthy();
  await user.click(screen.getByRole("switch", { name: "Pairs" }));
  expect(screen.getByText(/Pair ·/)).toBeTruthy();
  await user.selectOptions(screen.getByLabelText("Table rules"), "freebet");
  expect(screen.getByRole("button", { name: /Surrender/ }).disabled).toBe(true);
  expect(screen.getByText("HAND 01")).toBeTruthy();
  expect(screen.getByRole("switch", { name: "Pairs" }).checked).toBe(true);
  await user.click(screen.getByText("Table rules & strategy reference"));
  expect(screen.getAllByRole("table")).toHaveLength(3);
  await user.selectOptions(screen.getByLabelText("Table rules"), "h17");
  expect(screen.getAllByRole("table")).toHaveLength(4);
});
it("keeps browser tools current and unregisters them on unmount", () => {
  const tools = new Map();
  document.modelContext = {
    registerTool: vi.fn((tool) => tools.set(tool.name, tool)),
    unregisterTool: vi.fn((name) => tools.delete(name)),
  };
  const view = render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  expect(tools.size).toBe(3);
  const read = () => tools.get("read_practice_hand").execute();
  expect(read().answered).toBe(false);
  act(() => tools.get("answer_practice_hand").execute({ action: "Hit" }));
  expect(read().answeredCount).toBe(1);
  expect(() =>
    tools.get("answer_practice_hand").execute({ action: "Hit" }),
  ).toThrow();
  act(() => tools.get("deal_practice_hand").execute());
  expect(read().answered).toBe(false);
  view.unmount();
  expect(tools.size).toBe(0);
});
