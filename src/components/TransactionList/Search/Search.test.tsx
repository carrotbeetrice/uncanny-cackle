import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Search, { delay } from "./Search";

// Unit tests for the Search input and its debounce (brief D6). Filtering and
// Clear search are covered in TransactionList.test.tsx.

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("Search", () => {
  it("renders a labelled search box with the brief's placeholder", () => {
    render(<Search value="" onChange={vi.fn()} onSearch={vi.fn()} />);

    const input = screen.getByRole("searchbox", {
      name: "Search transactions",
    });
    expect(input).toHaveAttribute("placeholder", "Search transactions");
  });

  it("reports each keystroke without searching straight away", () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(<Search value="" onChange={onChange} onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "gr" },
    });

    expect(onChange).toHaveBeenCalledWith("gr");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("calls onSearch once typing pauses for the given delay", () => {
    const onSearch = vi.fn();
    render(<Search value="gr" onChange={vi.fn()} onSearch={onSearch} />);

    advance(delay - 1);
    expect(onSearch).not.toHaveBeenCalled();

    advance(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("gr");
  });

  it("restarts the timer when the value changes", () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <Search value="g" onChange={vi.fn()} onSearch={onSearch} />,
    );

    advance(delay - 100);
    rerender(<Search value="gro" onChange={vi.fn()} onSearch={onSearch} />);
    advance(delay - 100);
    expect(onSearch).not.toHaveBeenCalled();

    advance(delay);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("gro");
  });

  it("drops a pending search on unmount", () => {
    const onSearch = vi.fn();
    const { unmount } = render(
      <Search value="gr" onChange={vi.fn()} onSearch={onSearch} />,
    );

    advance(delay - 100);
    unmount();
    advance(delay * 2);

    expect(onSearch).not.toHaveBeenCalled();
  });
});
