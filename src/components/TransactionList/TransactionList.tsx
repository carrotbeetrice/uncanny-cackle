import type { Transaction as TransactionData } from "../../api/types";
import Transaction from "./Transaction/Transaction";
import "./TransactionList.css";

interface TransactionListProps {
  transactions: TransactionData[];
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  const displayedTransactions = transactions.slice(0, 8);
  return (
    <section className="transaction-list" aria-labelledby="transactions-title">
      <h2 id="transactions-title" className="transaction-list__title">
        Recent transactions
      </h2>
      <ul className="transaction-list__items">
        {displayedTransactions.map((transaction) => (
          <Transaction key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    </section>
  );
}
