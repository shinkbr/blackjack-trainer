import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  actions,
  createSession,
  drawHand,
  handTypes,
  readHand,
  sessionReducer,
} from "./game.js";

export default function usePractice() {
  const [state, setState] = useState(createSession);
  const current = useRef(state);
  // External tools may make consecutive calls before React commits a render.
  const send = useCallback((event) => {
    const next = sessionReducer(current.current, event);
    current.current = next;
    setState(next);
    return next;
  }, []);
  const deal = useCallback(
    (type = "deal", options = {}) => {
      const filters = options.filters ?? current.current.filters;
      return readHand(
        send({
          type,
          ...options,
          hand: drawHand(filters.length ? filters : handTypes),
        }),
      );
    },
    [send],
  );
  const choose = useCallback(
    (action) => send({ type: "answer", action }).answer,
    [send],
  );
  const focusFirstAction = useRef(false);
  const nextRef = useRef(null);
  const firstActionRef = useRef(null);
  useLayoutEffect(() => {
    if (state.answer) nextRef.current?.focus({ preventScroll: true });
    else if (focusFirstAction.current) {
      firstActionRef.current?.focus({ preventScroll: true });
      focusFirstAction.current = false;
    }
  }, [state.answer]);
  useEffect(() => {
    function onKeyDown(event) {
      if (
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.target.isContentEditable ||
        /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)
      )
        return;
      if (!current.current.answer && /^[1-5]$/.test(event.key)) {
        const action = actions[Number(event.key) - 1];
        const hand = readHand(current.current);
        if (
          (action === "Split" && !hand.pair) ||
          (action === "Surrender" && hand.mode === "freebet")
        )
          return;
        event.preventDefault();
        choose(action);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [choose]);
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const emptySchema = {
      type: "object",
      properties: {},
      additionalProperties: false,
    };
    const tools = [
      {
        name: "read_practice_hand",
        description: "Read the current blackjack practice hand.",
        inputSchema: emptySchema,
        annotations: { readOnlyHint: true },
        execute: () => readHand(current.current),
      },
      {
        name: "answer_practice_hand",
        description: "Submit a blackjack action and show strategy feedback.",
        inputSchema: {
          type: "object",
          properties: { action: { type: "string", enum: actions } },
          required: ["action"],
          additionalProperties: false,
        },
        execute: ({ action }) => choose(action),
      },
      {
        name: "deal_practice_hand",
        description: "Start a new randomized practice hand.",
        inputSchema: emptySchema,
        execute: () => deal(),
      },
    ];
    for (const tool of tools) {
      try {
        Promise.resolve(context.registerTool(tool)).catch(() => {});
      } catch {
        /* Optional browser API. */
      }
    }
    return () => {
      for (const tool of tools) {
        try {
          Promise.resolve(context.unregisterTool?.(tool.name)).catch(() => {});
        } catch {
          /* Optional browser API. */
        }
      }
    };
  }, [choose, deal]);
  return {
    state,
    choose,
    deal,
    nextRef,
    firstActionRef,
    nextHand: () => {
      focusFirstAction.current = true;
      deal();
    },
  };
}
