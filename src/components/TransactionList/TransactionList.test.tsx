import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Transaction } from "../../api/types";
import TransactionList from "./TransactionList";

// Spec tests for brief D5 (recent transactions).

const groceries: Transaction = {
  id: "txn_2001",
  accountId: "acc_checking",
  date: "2026-10-19T18:42:00+08:00",
  description: "FairPrice Finest",
  category: "groceries",
  direction: "out",
  amount: 86.4,
  status: "posted",
};

const grab: Transaction = {
  id: "txn_2002",
  accountId: "acc_credit",
  date: "2026-10-19T12:10:00+08:00",
  description: "Grab",
  category: "transport",
  direction: "out",
  amount: 14.2,
  status: "pending",
};

const payNow: Transaction = {
  id: "txn_2005",
  accountId: "acc_checking",
  date: "2026-10-16T09:30:00+08:00",
  description: "PayNow from Marcus Lee",
  category: "transfer",
  direction: "in",
  amount: 45,
  status: "posted",
};

describe("TransactionList", () => {
  it("shows a heading and one row per transaction, in the given order", () => {
    render(<TransactionList transactions={[groceries, grab, payNow]} />);

    expect(
      screen.getByRole("heading", { name: "Recent transactions" }),
    ).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("FairPrice Finest");
    expect(rows[2]).toHaveTextContent("PayNow from Marcus Lee");
  });

  it("shows only the 8 newest transactions", () => {
    // Newest first, as the API returns them: Txn 1 is 20 Oct, Txn 10 is 11 Oct.
    const transactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
      ...groceries,
      id: `txn_${i + 1}`,
      description: `Txn ${i + 1}`,
      date: `2026-10-${20 - i}T09:00:00+08:00`,
    }));
    render(<TransactionList transactions={transactions} />);

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(8);
    expect(rows[0]).toHaveTextContent("Txn 1");
    expect(rows[7]).toHaveTextContent("Txn 8");
    expect(screen.queryByText("Txn 9")).not.toBeInTheDocument();
    expect(screen.queryByText("Txn 10")).not.toBeInTheDocument();
  });
});
