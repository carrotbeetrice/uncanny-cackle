import { Input } from "@headlessui/react";
import { useEffect } from "react";
import "./Search.css";

export const delay = 300;

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
}

export default function Search({ value, onChange, onSearch }: SearchProps) {
  // Debounce: wait until typing pauses for `delay` ms before telling the
  // parent. Each new value cancels the previous timer.
  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), delay);
    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <Input
      type="search"
      className="search"
      placeholder="Search transactions"
      aria-label="Search transactions"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
