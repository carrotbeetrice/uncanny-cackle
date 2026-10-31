import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Customer } from "../../api/types";
import { SegmentProvider } from "../../theme/SegmentContext";
import { ThemeProvider } from "../../theme/ThemeContext";
import Header from "./Header";

// Spec tests for brief D2 (header). Written ahead of the implementation.
// Toggle behaviour lives in ThemeToggle.test.tsx and SegmentSwitch.test.tsx.
// The planned contract is:
// - `<Header customer={customer} />`, where `customer` is undefined while loading

const ava: Customer = {
  id: "cus_001",
  firstName: "Ava",
  lastName: "Chen",
  email: "ava.chen@example.com",
  segment: "retail",
  dailyTransferLimit: 5000,
  transferredToday: 0,
};

const html = document.documentElement;

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SegmentProvider defaultSegment={ava.segment}>{children}</SegmentProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  html.setAttribute("data-theme", "light");
  html.setAttribute("data-segment", "retail");
});

describe("Header", () => {
  describe("content (D2)", () => {
    it("shows the Meridian logo", () => {
      render(<Header customer={ava} />, { wrapper: Providers });

      expect(screen.getByText("Meridian")).toBeInTheDocument();
    });

    it("shows the customer's initials as the avatar", () => {
      render(<Header customer={ava} />, { wrapper: Providers });

      expect(screen.getByText("AC")).toBeInTheDocument();
    });

    it("does not show a greeting while the customer is loading", () => {
      render(<Header customer={undefined} />, { wrapper: Providers });

      expect(screen.queryByText(/good evening/i)).not.toBeInTheDocument();
    });

    it("shows Cards, Payments and Insights as disabled", () => {
      render(<Header customer={ava} />, { wrapper: Providers });

      for (const name of ["Cards", "Payments", "Insights"]) {
        expect(screen.getByText(name)).toHaveAttribute("aria-disabled", "true");
      }
    });

    it("includes the light/dark toggle", () => {
      render(<Header customer={ava} />, { wrapper: Providers });

      expect(
        screen.getByRole("button", { name: /dark mode/i }),
      ).toBeInTheDocument();
    });

    it("includes the Retail/Premium switch", () => {
      render(<Header customer={ava} />, { wrapper: Providers });

      expect(
        screen.getByRole("button", { name: "Retail" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Premium" }),
      ).toBeInTheDocument();
    });
  });
});
