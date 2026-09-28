const suitNames = {
  "♠": "spades",
  "♥": "hearts",
  "♦": "diamonds",
  "♣": "clubs",
};
export default function Card({ card }) {
  return (
    <div
      className={`card ${["♥", "♦"].includes(card.suit) ? "red" : ""}`}
      role="img"
      aria-label={`${card.rank} of ${suitNames[card.suit]}`}
    >
      <span className="corner" aria-hidden="true">
        {card.rank}
        <small>{card.suit}</small>
      </span>
      <span className="pip" aria-hidden="true">
        {card.suit}
      </span>
      <span className="corner bottom" aria-hidden="true">
        {card.rank}
        <small>{card.suit}</small>
      </span>
    </div>
  );
}
