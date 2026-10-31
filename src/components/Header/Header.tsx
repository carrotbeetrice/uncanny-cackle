import type { Customer } from "../../api/types";
import SegmentSwitch from "./SegmentSwitch/SegmentSwitch";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import "./Header.css";

interface HeaderProps {
  customer?: Customer;
}

// Only Overview exists. The rest are decoration (brief §2): shown disabled,
// not links, so they can't be focused or clicked.
const disabledNavItems = ["Cards", "Payments", "Insights"];

export default function Header({ customer }: HeaderProps) {
  return (
    <header className="header">
      <strong className="header-logo">Meridian</strong>
      <nav className="header-nav" aria-label="Main">
        <ul className="header-nav-list">
          <li>
            <a
              className="header-nav-item"
              href={import.meta.env.BASE_URL}
              aria-current="page"
            >
              Overview
            </a>
          </li>
          {disabledNavItems.map((item) => (
            <li key={item}>
              <span className="header-nav-item" aria-disabled="true">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </nav>
      <SegmentSwitch />
      <ThemeToggle />
      {customer && (
        <span
          className="header-avatar"
          role="img"
          aria-label={`${customer.firstName} ${customer.lastName}`}
        >
          {customer.firstName[0]}
          {customer.lastName[0]}
        </span>
      )}
    </header>
  );
}
