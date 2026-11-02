import type { Transaction as TransactionData } from "../../../api/types";
import { formatMoney, formatShortDate } from "../../../lib/format";
import "./Transaction.css";

interface TransactionProps {
  transaction: TransactionData;
}

// Money in gets a "+" and the positive colour; money out uses the normal
// text colour (brief D5).
function formatAmount(transaction: TransactionData) {
  return transaction.direction === "in"
    ? `+${formatMoney(transaction.amount)}`
    : formatMoney(-transaction.amount);
}

// One row of the transaction list. Renders an <li>, so it must sit inside
// a <ul>.
export default function Transaction({ transaction }: TransactionProps) {
  return (
    <li className="transaction">
      <div className="transaction__details">
        <span className="transaction__description">
          {transaction.description}
        </span>
        <span className="transaction__meta">
          <span className="transaction__category">{transaction.category}</span>
          {" · "}
          {formatShortDate(transaction.date)}
        </span>
      </div>
      <div className="transaction__end">
        <span
          className={`transaction__amount transaction__amount--${transaction.direction}`}
        >
          {formatAmount(transaction)}
        </span>
        {transaction.status === "pending" && (
          <span className="transaction__chip">Pending</span>
        )}
      </div>
    </li>
  );
}
