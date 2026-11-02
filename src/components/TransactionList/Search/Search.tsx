import { useEffect } from "react";
import "./Search.css";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  delay?: number;
}

export default function Search({
  value,
  onChange,
  onSearch,
  delay = 300,
}: SearchProps) {
  // Debounce: wait until typing pauses for `delay` ms before telling the
  // parent. Each new value cancels the previous timer.
  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay, onSearch]);

  return (
    <input
      type="search"
      className="search"
      placeholder="Search transactions"
      aria-label="Search transactions"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
