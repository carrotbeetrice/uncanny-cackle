import { Radio, RadioGroup } from "@headlessui/react";
import { useSegment, type Segment } from "../../../theme/SegmentContext";
import "./SegmentSwitch.css";

const options: { value: Segment; label: string }[] = [
  { value: "retail", label: "Retail" },
  { value: "premium", label: "Premium" },
];

// Headless UI's RadioGroup gives role="radiogroup"/"radio", aria-checked and
// arrow-key navigation between the options.
export default function SegmentSwitch() {
  const { segment, chooseSegment } = useSegment();

  return (
    <RadioGroup
      className="segment-switch"
      aria-label="Customer segment"
      value={segment}
      onChange={chooseSegment}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          className="segment-switch-option"
        >
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
