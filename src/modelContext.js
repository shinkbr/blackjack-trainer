import { actions } from "./game.js";

const emptySchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

function safelyCall(callback) {
  try {
    // This optional browser integration must not interrupt practice.
    Promise.resolve(callback()).catch(() => {});
  } catch {
    // Browsers may expose the API without supporting tool registration.
  }
}

export function registerPracticeTools(context, { read, choose, deal }) {
  if (!context?.registerTool) return;

  const tools = [
    {
      name: "read_practice_hand",
      description: "Read the current blackjack practice hand.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true },
      execute: read,
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
      execute: deal,
    },
  ];

  for (const tool of tools) {
    safelyCall(() => context.registerTool(tool));
  }

  return () => {
    for (const { name } of tools) {
      safelyCall(() => context.unregisterTool?.(name));
    }
  };
}
