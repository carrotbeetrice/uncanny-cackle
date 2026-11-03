import { Switch } from "@headlessui/react";
import { useTheme } from "../../../theme/ThemeContext";
import "./ThemeToggle.css";

// Headless UI's Switch renders a button with role="switch" and aria-checked,
// and handles Space/Enter for us.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Switch
      className="theme-toggle"
      aria-label="Dark mode"
      checked={theme === "dark"}
      onChange={toggleTheme}
    >
      ◐
    </Switch>
  );
}
