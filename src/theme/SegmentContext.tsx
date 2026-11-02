import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Segment } from "../api/types";

// Same values as the API and the `data-segment` selectors in design-tokens.css.
// Display labels ("Retail" / "Premium") belong in the component.
export type { Segment };

interface SegmentContextValue {
  segment: Segment;
  chooseSegment: (choice: Segment) => void;
}

interface SegmentProviderProps {
  children: ReactNode;
  // The customer's own segment from the API. Undefined while it loads.
  defaultSegment?: Segment;
}

const SegmentContext = createContext<SegmentContextValue | null>(null);

function readSavedSegment(): Segment | null {
  try {
    const saved = localStorage.getItem("meridian-segment");
    return saved === "retail" || saved === "premium" ? saved : null;
  } catch {
    return null;
  }
}

export function SegmentProvider({
  children,
  defaultSegment,
}: SegmentProviderProps) {
  // Only the user's explicit choice is stored. The segment shown is derived:
  // saved choice, else the customer's default, else retail.
  const [choice, setChoice] = useState<Segment | null>(readSavedSegment);
  const segment = choice ?? defaultSegment ?? "retail";

  // The inline script in index.html applies a saved choice before first
  // paint. This keeps <html> in sync afterwards, including when the
  // customer's default arrives from the API.
  useEffect(() => {
    document.documentElement.dataset.segment = segment;
  }, [segment]);

  function chooseSegment(next: Segment) {
    try {
      localStorage.setItem("meridian-segment", next);
    } catch {
      // Storage can be blocked (e.g. private mode); the switch still works.
    }
    setChoice(next);
  }

  return (
    <SegmentContext.Provider value={{ segment, chooseSegment }}>
      {children}
    </SegmentContext.Provider>
  );
}

export function useSegment() {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error("useSegment must be used inside SegmentProvider");
  }
  return context;
}
