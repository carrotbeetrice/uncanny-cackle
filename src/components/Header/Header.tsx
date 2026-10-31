import type { Customer } from "../../api/types";
import "./Header.css";

interface HeaderProps {
  customer?: Customer;
}

export default function Header(props: HeaderProps) {
  return (
    <header className="header">
      <strong className="header-logo">Meridian</strong>
      <span className="header-tagline">Take-home starter</span>
    </header>
  );
}
