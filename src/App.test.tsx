import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import App from "./App";
import { server } from "./test/setup";
import { ThemeProvider } from "./theme/ThemeContext";
import type { Customer } from "./api/types";

const ava: Customer = {
  id: "cus_001",
  firstName: "Ava",
  lastName: "Chen",
  email: "ava.chen@example.com",
  segment: "retail",
  dailyTransferLimit: 5000,
  transferredToday: 0,
};

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("App", () => {
  it("loads the customer from the mock API and shows the page", async () => {
    renderApp();

    // Skeletons show straight away, before any data arrives (D1).
    const loading = screen.getByRole("status");
    expect(loading).toHaveTextContent(/loading your dashboard/i);
    expect(loading).toHaveAttribute("aria-busy", "true");
    expect(
      screen.queryByText(`Good evening, ${ava.firstName}`),
    ).not.toBeInTheDocument();

    // Mock responses take ~500 ms, so wait for the loaded state.
    expect(
      await screen.findByText(
        `Good evening, ${ava.firstName}`,
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(loading).not.toBeInTheDocument();
  });

  // api-contract.md: the customer's `segment` is the default until the
  // switch overrides it.
  it("starts on the customer's segment from the API", async () => {
    localStorage.clear();
    document.documentElement.setAttribute("data-segment", "retail");
    server.use(
      http.get("*/api/customer", () =>
        HttpResponse.json({ customer: { ...ava, segment: "premium" } }),
      ),
    );
    renderApp();

    await screen.findByText(
      `Good evening, ${ava.firstName}`,
      {},
      { timeout: 3000 },
    );
    expect(document.documentElement).toHaveAttribute("data-segment", "premium");
  });

  // E4.3
  it("shows an error when the dashboard fails to load and Retry recovers", async () => {
    const user = userEvent.setup();
    // Fail the first customer request only; Retry then hits the real handler.
    server.use(
      http.get(
        "*/api/customer",
        () =>
          HttpResponse.json(
            {
              error: {
                code: "INTERNAL_ERROR",
                message: "Something went wrong.",
              },
            },
            { status: 500 },
          ),
        { once: true },
      ),
    );
    renderApp();

    expect(
      await screen.findByText(
        "We couldn't load your dashboard.",
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    // Skeletons show after clicking retry.
    expect(await screen.findByRole("status")).toHaveTextContent(
      /loading your dashboard/i,
    );
    expect(
      screen.queryByText("We couldn't load your dashboard."),
    ).not.toBeInTheDocument();

    expect(
      await screen.findByText(
        `Good evening, ${ava.firstName}`,
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load your dashboard."),
    ).not.toBeInTheDocument();
  });
});
