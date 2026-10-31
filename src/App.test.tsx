import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { ThemeProvider } from "./theme/ThemeContext";
import { SegmentProvider } from "./theme/SegmentContext";

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SegmentProvider>
          <App />
        </SegmentProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

// Placeholder until the dashboard exists. The E4 tests (over-balance
// error, successful transfer, dashboard error + Retry) belong here.
describe("App", () => {
  it("loads the customer from the mock API and shows the page", async () => {
    renderApp();

    // Loading state shows straight away, before any data arrives.
    expect(screen.getByText("Placeholder")).toBeInTheDocument();
    expect(screen.queryByText("Hello world!")).not.toBeInTheDocument();

    // Mock responses take ~500 ms, so wait for the loaded state.
    expect(
      await screen.findByText("Good evening, Ava", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hello world!")).toBeInTheDocument();
    expect(screen.queryByText("Placeholder")).not.toBeInTheDocument();
  });
});
