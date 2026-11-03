import { Button } from "@headlessui/react";
import { useState } from "react";
import type { Transaction as TransactionData } from "../../api/types";
import Search from "./Search/Search";
import Transaction from "./Transaction/Transaction";
import "./TransactionList.css";

interface TransactionListProps {
  transactions: TransactionData[];
}

function matchesSearch(transaction: TransactionData, searchTerm: string) {
  const term = searchTerm.trim().toLowerCase();
  return (
    transaction.description.toLowerCase().includes(term) ||
    transaction.category.toLowerCase().includes(term)
  );
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  // `query` is what's in the input; `searchTerm` is the debounced value
  // used for filtering.
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isSearching = searchTerm.trim() !== "";
  // Search filters the 8 newest rows only (brief/api-contract.md, D6).
  const displayedTransactions = transactions
    .slice(0, 8)
    .filter((transaction) => matchesSearch(transaction, searchTerm));

  function clearSearch() {
    setQuery("");
    setSearchTerm("");
  }

  return (
    <section className="transaction-list" aria-labelledby="transactions-title">
      <div className="transaction-list__header">
        <h2 id="transactions-title" className="transaction-list__title">
          Recent transactions
        </h2>
        <div className="transaction-list__search">
          <Search value={query} onChange={setQuery} onSearch={setSearchTerm} />
        </div>
      </div>

      {isSearching && displayedTransactions.length > 0 && (
        <div className="transaction-list__summary">
          <p className="transaction-list__count" aria-live="polite">
            {displayedTransactions.length}{" "}
            {displayedTransactions.length === 1 ? "result" : "results"}
          </p>
          <Button
            className="transaction-list__clear"
            onClick={clearSearch}
          >
            Clear search
          </Button>
        </div>
      )}

      {displayedTransactions.length > 0 ? (
        <ul className="transaction-list__items">
          {displayedTransactions.map((transaction) => (
            <Transaction key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      ) : (
        isSearching && (
          <div className="transaction-list__empty">
            <p className="transaction-list__empty-message" aria-live="polite">
              No transactions match your search.
            </p>
            <Button
              className="transaction-list__clear"
              onClick={clearSearch}
            >
              Clear search
            </Button>
          </div>
        )
      )}
    </section>
  );
}
