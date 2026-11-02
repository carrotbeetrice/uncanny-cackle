import { getDefaultNormalizer, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Transaction as TransactionData } from "../../../api/types";
import { formatMoney } from "../../../lib/format";
import Transaction from "./Transaction";

// Spec tests for one row of the brief D5 transaction list.

const groceries: TransactionData = {
  id: "txn_2001",
  accountId: "acc_checking",
  date: "2026-10-19T18:42:00+08:00",
  description: "FairPrice Finest",
  category: "groceries",
  direction: "out",
  amount: 86.4,
  status: "posted",
};

const payNow: TransactionData = {
  id: "txn_2005",
  accountId: "acc_checking",
  date: "2026-10-16T09:30:00+08:00",
  description: "PayNow from Marcus Lee",
  category: "transfer",
  direction: "in",
  amount: 45,
  status: "posted",
};

// The row is an <li>, so render it inside a list.
function renderRow(transaction: TransactionData) {
  return render(
    <ul>
      <Transaction transaction={transaction} />
    </ul>,
  );
}

// Keep the non-breaking space after "SGD" so it matches formatMoney.
const exact = {
  normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
};

describe("Transaction", () => {
  it("shows the description, category and short date", () => {
    renderRow(groceries);

    const row = screen.getByRole("listitem");
    expect(row).toHaveTextContent("FairPrice Finest");
    expect(screen.getByText("groceries")).toBeInTheDocument();
    expect(row).toHaveTextContent("19 Oct");
  });

  it("prefixes money out with -", () => {
    renderRow(groceries);

    expect(screen.getByText(formatMoney(-86.4), exact)).toBeInTheDocument();
  });

  it("prefixes money in with +", () => {
    renderRow(payNow);

    expect(screen.getByText(`+${formatMoney(45)}`, exact)).toBeInTheDocument();
  });

  it("shows a Pending chip for pending transactions", () => {
    renderRow({ ...groceries, status: "pending" });

    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows no chip for posted transactions", () => {
    renderRow(groceries);

    expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  });
});
