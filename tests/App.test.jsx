import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { drawHand } from "../src/game.js";
import { makeHand, makeSession } from "./fixtures.js";

vi.mock("../src/game.js", async (importOriginal) => ({
  ...(await importOriginal()),
  drawHand: vi.fn(),
  createSession: () => makeSession(),
}));

function setup() {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return user;
}

beforeEach(() => {
  vi.mocked(drawHand).mockReturnValue(makeHand());
});

describe("practice interface", () => {
  it("supports keyboard answers and restores focus on the next hand", async () => {
    const user = setup();
    await user.keyboard("1");
    const next = screen.getByRole("button", { name: /Next hand/ });
    expect(document.activeElement).toBe(next);
    expect(screen.getByRole("button", { name: /Hit/ }).disabled).toBe(true);
    await user.click(next);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /Hit/ }),
    );
    expect(screen.getByText("HAND 02")).toBeTruthy();
  });

  it("shows correct feedback and session accuracy", async () => {
    const user = setup();
    await user.keyboard("5");
    expect(screen.getByRole("status").textContent).toContain("Correct!");
    expect(
      screen.getByLabelText("100% correct; 1 of 1 answered hands"),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Reset Count" }));
    expect(
      screen.getByLabelText("0% correct; 0 of 0 answered hands"),
    ).toBeTruthy();
  });

  it("uses selected hand filters and preserves them when rules change", async () => {
    const user = setup();
    vi.mocked(drawHand).mockReturnValue(makeHand("8", "8", "6"));
    await user.click(screen.getByRole("switch", { name: "Pairs" }));
    expect(drawHand).toHaveBeenLastCalledWith(["pairs"]);
    expect(screen.getByText("Pair · 16")).toBeTruthy();
    await user.selectOptions(screen.getByLabelText("Table rules"), "freebet");
    expect(screen.getByRole("switch", { name: "Pairs" }).checked).toBe(true);
    expect(screen.getByText("HAND 01")).toBeTruthy();
  });

  it("ignores unavailable keyboard actions", async () => {
    const user = setup();
    await user.keyboard("4");
    expect(screen.getByRole("button", { name: /Hit/ }).disabled).toBe(false);
    await user.selectOptions(screen.getByLabelText("Table rules"), "freebet");
    screen.getByRole("button", { name: /Hit/ }).focus();
    await user.keyboard("5");
    expect(screen.getByRole("button", { name: /Surrender/ }).disabled).toBe(
      true,
    );
    expect(screen.getByRole("button", { name: /Hit/ }).disabled).toBe(false);
  });

  it("ignores shortcuts while selecting rules and with modifier keys", async () => {
    const user = setup();
    screen.getByLabelText("Table rules").focus();
    await user.keyboard("1");
    screen.getByRole("button", { name: /Hit/ }).focus();
    await user.keyboard("{Control>}1{/Control}{Alt>}1{/Alt}{Meta>}1{/Meta}");
    expect(screen.getByRole("button", { name: /Hit/ }).disabled).toBe(false);
  });

  it("shows strategy tables for the selected rules", async () => {
    const user = setup();
    expect(screen.getAllByRole("table")).toHaveLength(4);
    await user.selectOptions(screen.getByLabelText("Table rules"), "freebet");
    expect(screen.getAllByRole("table")).toHaveLength(3);
    await user.selectOptions(screen.getByLabelText("Table rules"), "h17");
    expect(screen.getAllByRole("table")).toHaveLength(4);
  });
});
