import { useEffect } from "react";
import { actions, actionUnavailableReason, readHand } from "./game.js";

const editableTags = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function shouldIgnoreShortcut(event) {
  return (
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.target?.isContentEditable ||
    editableTags.has(event.target?.tagName)
  );
}

export default function usePracticeKeyboard(sessionRef, choose) {
  useEffect(() => {
    function onKeyDown(event) {
      if (shouldIgnoreShortcut(event) || sessionRef.current.answer) return;
      if (!/^[1-5]$/.test(event.key)) return;

      const action = actions[Number(event.key) - 1];
      if (actionUnavailableReason(action, readHand(sessionRef.current))) return;

      event.preventDefault();
      choose(action);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sessionRef, choose]);
}
