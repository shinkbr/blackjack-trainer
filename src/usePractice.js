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
  actionUnavailableReason,
  readHand,
  sessionReducer,
} from "./game.js";

import { registerPracticeTools } from "./modelContext.js";

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
          hand: drawHand(filters),
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
        event.target?.isContentEditable ||
        /INPUT|TEXTAREA|SELECT/.test(event.target?.tagName)
      )
        return;
      if (!current.current.answer && /^[1-5]$/.test(event.key)) {
        const action = actions[Number(event.key) - 1];
        const hand = readHand(current.current);
        if (actionUnavailableReason(action, hand)) return;
        event.preventDefault();
        choose(action);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [choose]);
  useEffect(
    () =>
      registerPracticeTools(document.modelContext, {
        read: () => readHand(current.current),
        choose,
        deal: () => deal(),
      }),
    [choose, deal],
  );
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
