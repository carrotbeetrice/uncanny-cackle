import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Transaction } from "../../api/types";
import TransactionList from "./TransactionList";

// Spec tests for brief D5 (recent transactions) and D6 (search).

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

  it("filters by description or category, ignoring case, and shows the count", async () => {
    const user = userEvent.setup();
    render(<TransactionList transactions={[groceries, grab, payNow]} />);
    const search = screen.getByRole("searchbox", {
      name: "Search transactions",
    });

    await user.type(search, "GRAB");
    expect(await screen.findByText("1 result")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("listitem")).toHaveTextContent("Grab");

    await user.clear(search);
    await user.type(search, "Transfer");
    expect(
      await screen.findByText("PayNow from Marcus Lee"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("shows the no-results state and Clear search restores the list", async () => {
    const user = userEvent.setup();
    render(<TransactionList transactions={[groceries, grab, payNow]} />);
    const search = screen.getByRole("searchbox", {
      name: "Search transactions",
    });

    await user.type(search, "zzz");
    expect(
      await screen.findByText("No transactions match your search."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

    // Only the no-matches message has a Clear search button here.
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(search).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
