import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createSession, drawHand, readHand, sessionReducer } from "./game.js";

import usePracticeKeyboard from "./usePracticeKeyboard.js";
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
  usePracticeKeyboard(current, choose);
  useEffect(
    () =>
      registerPracticeTools(document.modelContext, {
        read: () => readHand(current.current),
        choose,
        deal: () => deal(),
      }),
    [choose, deal],
  );
  const nextHand = useCallback(() => {
    focusFirstAction.current = true;
    deal();
  }, [deal]);
  const resetCount = useCallback(() => deal("reset"), [deal]);
  const changeMode = useCallback((mode) => deal("mode", { mode }), [deal]);
  const toggleFilter = useCallback(
    (type) => {
      const { filters } = current.current;
      const nextFilters = filters.includes(type)
        ? filters.filter((filter) => filter !== type)
        : [...filters, type];
      return deal("filters", { filters: nextFilters });
    },
    [deal],
  );

  return {
    state,
    choose,
    nextHand,
    resetCount,
    changeMode,
    toggleFilter,
    nextRef,
    firstActionRef,
  };
}
