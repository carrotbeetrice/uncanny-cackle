import { useSegment, type Segment } from "../../theme/SegmentContext";
import "./SegmentSwitch.css";

const options: { value: Segment; label: string }[] = [
  { value: "retail", label: "Retail" },
  { value: "premium", label: "Premium" },
];

export default function SegmentSwitch() {
  const { segment, chooseSegment } = useSegment();

  return (
    <div className="segment-switch" role="group" aria-label="Customer segment">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="segment-switch-option"
          aria-pressed={segment === option.value}
          onClick={() => chooseSegment(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
