import type { Customer } from "../../api/types";
import SegmentSwitch from "../SegmentSwitch/SegmentSwitch";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./Header.css";

interface HeaderProps {
  customer?: Customer;
}

export default function Header(props: HeaderProps) {
  return (
    <header className="header">
      <strong className="header-logo">Meridian</strong>
      <span className="header-tagline">Take-home starter</span>
      <SegmentSwitch />
      <ThemeToggle />
    </header>
  );
}
