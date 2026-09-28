import { ruleModes } from "./strategy.js";
export function rulesDescription(currentMode) {
  const free = currentMode === "freebet",
    h17 = currentMode === "h17",
    mode = ruleModes[currentMode];
  return free
    ? "6 decks. Dealer hits soft 17 (H17). Free doubles on two-card hard 9, 10 or 11; other doubles use your own money. Free splits on matching-rank pairs except ten-value cards. A pair of fives is best free-doubled. Double after split allowed; re-split up to four hands, including aces. No surrender. Dealer 22 pushes surviving non-blackjack hands; a player bust still loses, and a natural blackjack pays 3:2. Dealer checks for blackjack before play. This mode practices the initial real-money hand."
    : `6 decks. Dealer ${mode.dealer} (${h17 ? "H17" : "S17"}). Double on any first two cards; double after split allowed. Late surrender on the initial two cards after the dealer checks for blackjack. Assume that check is complete. Only cards of the same rank may be split. Blackjack pays 3:2.`;
}
