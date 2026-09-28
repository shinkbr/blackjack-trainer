export const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
export const suits = ["♠", "♥", "♦", "♣"];

export function rankValue(rank) {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

export function createCard(rank, suit) {
  return { rank, suit, value: rankValue(rank) };
}
